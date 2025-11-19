import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationService } from '../../services/station.service';
import { Station } from '../../models/station.model';

@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './station-list.component.html',
  styleUrls: ['./station-list.component.css'],
})
export class StationListComponent implements OnInit {
  private api = inject(StationService);

  stations = signal<Station[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (res) => {
        this.stations.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set('Không tải được danh sách trạm.');
        this.loading.set(false);
      },
    });
  }
}
