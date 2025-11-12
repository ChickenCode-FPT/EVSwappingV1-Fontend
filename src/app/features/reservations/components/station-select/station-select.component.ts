import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { StationService } from '../../../station/services/station.service';
import { Station } from '../../../station/models/station.model';

@Component({
  selector: 'app-station-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './station-select.component.html',
  styleUrls: ['./station-select.component.css']
})
export class StationSelectComponent implements OnInit {
  private api = inject(StationService);

  @Input() control = new FormControl<number | null>(null);
  @Output() selected = new EventEmitter<Station>();

  stations: Station[] = [];
  loading = false;
  errorMsg = '';

  ngOnInit() {
    this.loadStations();
    this.control.valueChanges.subscribe(id => {
      const st = this.stations.find(s => s.stationId === id);
      if (st) this.selected.emit(st);
    });
  }

  loadStations() {
    this.loading = true;
    this.api.getAll().subscribe({
      next: res => {
        this.stations = res;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Không tải được danh sách trạm.';
        this.loading = false;
      }
    });
  }
}
