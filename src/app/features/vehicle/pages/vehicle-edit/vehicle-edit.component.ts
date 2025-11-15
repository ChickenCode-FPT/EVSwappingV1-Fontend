// src\app\features\vehicle\pages\vehicle-edit\vehicle-edit.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { BatteryModelService } from '../../../battery-model/services/battery-model.service';
import { BatteryModel } from '../../../battery-model/models/battery-model.model';

@Component({
  selector: 'app-vehicle-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-edit.component.html',
  styleUrls: ['./vehicle-edit.component.css'],
})
export class VehicleEditComponent implements OnInit {
  private api = inject(VehicleService);
  private batteryApi = inject(BatteryModelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vehicleId!: number;

  batteryModels: BatteryModel[] = [];

  form = {
    vin: '',
    make: '',
    model: '',
    year: '',
    batteryModelPreferenceId: null as number | null,
  };

  loading = true;
  saving = false;
  errorMessage = '';
  success = false;

  ngOnInit() {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));

    // Load battery models first
    this.batteryApi.getAll().subscribe({
      next: (res) => (this.batteryModels = res),
      error: () => (this.errorMessage = 'Không tải được danh sách model pin.'),
    });

    this.loadVehicle();
  }

  loadVehicle() {
    this.api.getById(this.vehicleId).subscribe({
      next: (v: Vehicle) => {
        this.form.vin = v.vin;
        this.form.make = v.make;
        this.form.model = v.model;
        this.form.year = v.year?.toString() ?? '';
        this.form.batteryModelPreferenceId = v.batteryModelPreferenceId ?? null;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Không tải được dữ liệu xe.';
        this.loading = false;
      },
    });
  }

  validate(): boolean {
    if (
      !this.form.vin ||
      !this.form.make ||
      !this.form.model ||
      !this.form.year ||
      !this.form.batteryModelPreferenceId
    ) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return false;
    }

    return true;
  }

  submit() {
    if (!this.validate()) return;

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      vehicleId: this.vehicleId,
      vin: this.form.vin,
      make: this.form.make,
      model: this.form.model,
      year: Number(this.form.year),
      batteryModelPreferenceId: Number(this.form.batteryModelPreferenceId),
    };

    this.api.update(this.vehicleId, payload).subscribe({
      next: () => {
        this.success = true;
        this.saving = false;
        setTimeout(() => this.router.navigate(['/vehicles']), 1500);
      },
      error: () => {
        this.errorMessage = 'Không thể cập nhật. Vui lòng thử lại.';
        this.saving = false;
      },
    });
  }

  back() {
    this.router.navigate(['/vehicles']);
  }
}
