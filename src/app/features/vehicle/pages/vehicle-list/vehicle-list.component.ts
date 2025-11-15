// src\app\features\vehicle\pages\vehicle-list\vehicle-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css'],
})
export class VehicleListComponent implements OnInit {
  private api = inject(VehicleService);
  private router = inject(Router);

  vehicles = signal<Vehicle[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    this.loadVehicles();
  }

  goAdd() {
    this.router.navigate(['/vehicles/add']);
  }

  getIcon(make: string): string {
    make = make.toLowerCase();
    if (make.includes('vin')) return 'electric_scooter';
    if (make.includes('yamaha')) return 'two_wheeler';
    if (make.includes('honda')) return 'motorcycle';
    return 'directions_car';
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
