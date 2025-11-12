import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { VehicleService } from '../../../vehicle/services/vehicle.service';
import { Vehicle } from '../../../vehicle/models/vehicle.model';

@Component({
  selector: 'app-vehicle-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-select.component.html',
  styleUrls: ['./vehicle-select.component.css']
})
export class VehicleSelectComponent implements OnInit {
  private api = inject(VehicleService);

  @Input() control = new FormControl<number | null>(null);
  @Output() selected = new EventEmitter<Vehicle>();

  vehicles: Vehicle[] = [];
  loading = false;
  errorMsg = '';

  ngOnInit() {
    this.loadVehicles();
    this.control.valueChanges.subscribe(id => {
      const v = this.vehicles.find(v => v.vehicleId === id);
      if (v) this.selected.emit(v);
    });
  }

  loadVehicles() {
    this.loading = true;
    this.api.getMine().subscribe({
      next: res => {
        this.vehicles = res;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Không tải được danh sách xe.';
        this.loading = false;
      }
    });
  }
}
