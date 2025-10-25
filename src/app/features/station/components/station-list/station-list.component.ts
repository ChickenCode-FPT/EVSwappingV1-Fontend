// src/app/station/components/station-list/station-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Station } from '../../models/station.model';
import { BatteryService } from '../../services/battery.service';

type SortKey = 'nearest' | 'name' | 'batteries' | 'duration';

type ModelOpt = { id: number; count: number };

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
  /** Emit đến parent để mở form đặt lịch hoặc call trực tiếp
   *  batteryModelId có thể null → nghĩa là “bất kỳ model còn hàng” */
  @Output() reserve = new EventEmitter<{ station: Station; batteryModelId: number | null }>();

  constructor(private batteryApi: BatteryService) {}

  // UI state
  searchText = '';
  sortBy: SortKey = 'nearest';
  showOnlyReachable = false;
  reachRadiusKm = 20;
  expandedId: number | null = null;

  /** Cache dữ liệu model theo stationId */
  modelCache: Record<number, {
    loading: boolean;
    loaded: boolean;
    error?: string;
    options: ModelOpt[];
    selected: number | null;
  }> = {};

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
        entry.options = opts.sort((a, b) => b.count - a.count); // ưu tiên model nhiều hàng
        entry.selected = entry.options.length ? entry.options[0].id : null; // chọn mặc định nếu có
        entry.loaded = true;
        entry.loading = false;
      },
      error: (err) => {
        entry.error = err?.error?.detail || 'Không lấy được danh sách model còn hàng';
        entry.loading = false;
      }
    });
  }

  refreshModels(stationId: number) {
    // buộc reload
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
    const entry = this.modelCache[st.stationId];
    const modelId = entry?.selected ?? null;
    this.reserve.emit({ station: st, batteryModelId: modelId });
  }

  get filtered(): Station[] {
    let list = [...this.stations];

    const q = this.searchText.trim().toLowerCase();
    if (q) {
      list = list.filter(
        s =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q)
      );
    }

    if (this.showOnlyReachable && this.userLocation) {
      list = list.filter(s => (s.distanceKm ?? Infinity) <= this.reachRadiusKm);
    }

    list.sort((a, b) => {
      switch (this.sortBy) {
        case 'nearest':
          return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
        case 'duration':
          return (a.durationMin ?? Infinity) - (b.durationMin ?? Infinity);
        case 'batteries':
          return (b.availableBatteries ?? 0) - (a.availableBatteries ?? 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    return list;
  }

  trackById(_: number, s: Station) { return s.stationId; }

  canReserve(st: Station): boolean {
    return st.status === 1 && (st.availableBatteries ?? 0) > 0;
  }

  // tiện: lấy entry cache an toàn
  getEntry(stationId: number) {
    return this.modelCache[stationId];
  }
}
