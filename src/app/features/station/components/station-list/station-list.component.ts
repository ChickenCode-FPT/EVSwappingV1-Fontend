// src/app/map/components/station-list/station-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 THÊM DÒNG NÀY
import { Station } from '../../models/station.model';

type SortKey = 'nearest' | 'name' | 'batteries' | 'duration';

@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 THÊM FormsModule VÀO ĐÂY
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

  // UI state
  searchText = '';
  sortBy: SortKey = 'nearest';
  showOnlyReachable = false;
  reachRadiusKm = 20;
  expandedId: number | null = null;

  toggleExpand(st: Station) {
    this.expandedId = this.expandedId === st.stationId ? null : st.stationId;
  }

  onClickNearest() {
    this.requestNearest.emit();
  }

  onSelect(st: Station) {
    this.selectStation.emit(st);
  }

  get filtered(): Station[] {
    let list = [...this.stations];

    // search theo tên/địa chỉ
    const q = this.searchText.trim().toLowerCase();
    if (q) {
      list = list.filter(
        s =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q)
      );
    }

    // lọc theo bán kính nếu bật
    if (this.showOnlyReachable && this.userLocation) {
      list = list.filter(s => (s.distanceKm ?? Infinity) <= this.reachRadiusKm);
    }

    // sort
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
}
