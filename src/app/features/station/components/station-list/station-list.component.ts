// src/app/station/components/station-list/station-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Station } from '../../models/station.model';
import { BatteryService } from '../../services/battery.service';

type SortKey = 'nearest' | 'name' | 'batteries' | 'duration';

// Model summary FE dùng sau khi grouping từ battery list
type ModelOpt = {
  id: number;
  displayName: string;
  count: number;
};

@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './station-list.component.html',
  styleUrls: ['./station-list.component.css'],
})
export class StationListComponent {
  @Input() stations: Station[] = [];
  @Input() userLocation: [number, number] | null = null;
  @Input() findingNearest = false;
  @Input() geoStatusMsg = '';

  @Output() requestNearest = new EventEmitter<void>();
  @Output() selectStation = new EventEmitter<Station>();
  @Output() reserve = new EventEmitter<{ station: Station; batteryModelId: number | null }>();

  constructor(private batteryApi: BatteryService) {}

  searchText = '';
  sortBy: SortKey = 'nearest';
  showOnlyReachable = false;
  reachRadiusKm = 20;
  expandedId: number | null = null;

  modelCache: Record<
    number,
    {
      loading: boolean;
      loaded: boolean;
      error?: string;
      options: ModelOpt[];
      selected: number | null; 
    }
  > = {};

  toggleExpand(st: Station) {
    const newId = this.expandedId === st.stationId ? null : st.stationId;
    this.expandedId = newId;
    if (newId != null) {
      this.ensureModelsLoaded(st.stationId);
    }
  }

  private ensureModelsLoaded(stationId: number) {
    if (!this.modelCache[stationId]) {
      this.modelCache[stationId] = { loading: false, loaded: false, options: [], selected: null };
    }
    const entry = this.modelCache[stationId];
    if (entry.loaded || entry.loading) return;

    entry.loading = true;
    entry.error = undefined;

    this.batteryApi.getAvailableModelsSummary(stationId).subscribe({
      next: (opts) => {
        entry.options = opts.sort((a, b) => b.count - a.count);
        entry.selected = null; 
        entry.loaded = true;
        entry.loading = false;
      },
      error: (err) => {
        entry.error = err?.error?.detail || 'Không lấy được danh sách model còn hàng';
        entry.loading = false;
      },
    });
  }

  refreshModels(stationId: number) {
    this.modelCache[stationId] = { loading: false, loaded: false, options: [], selected: null };
    this.ensureModelsLoaded(stationId);
  }

  onClickNearest() {
    this.requestNearest.emit();
  }

  onSelect(st: Station) {
    this.selectStation.emit(st);
  }

  onReserve(st: Station) {
    this.reserve.emit({ station: st, batteryModelId: null });
  }

  get filtered(): Station[] {
    let list = [...this.stations];

    const q = this.searchText.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q)
      );
    }

    if (this.showOnlyReachable && this.userLocation) {
      list = list.filter((s) => (s.distanceKm ?? Infinity) <= this.reachRadiusKm);
    }

    list.sort((a, b) => {
      switch (this.sortBy) {
        case 'nearest': return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
        case 'duration': return (a.durationMin ?? Infinity) - (b.durationMin ?? Infinity);
        case 'batteries': return (b.availableBatteries ?? 0) - (a.availableBatteries ?? 0);
        case 'name': return (a.name || '').localeCompare(b.name || '');
        default: return 0;
      }
    });

    return list;
  }

  trackById(_: number, s: Station) {
    return s.stationId;
  }

  canReserve(st: Station): boolean {
    return st.status === 1 && (st.availableBatteries ?? 0) > 0;
  }

  getEntry(stationId: number) {
    return this.modelCache[stationId];
  }
}
