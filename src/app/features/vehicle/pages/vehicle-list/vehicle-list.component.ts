import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css'],
})
export class VehicleListComponent implements OnInit {
  private api = inject(VehicleService);

  vehicles = signal<Vehicle[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading.set(true);
    this.api.getMine().subscribe({
      next: (res) => {
        this.vehicles.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Không tải được danh sách xe.');
        this.loading.set(false);
      },
    });
  }
}
