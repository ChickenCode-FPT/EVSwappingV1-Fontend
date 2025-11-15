// src\app\features\vehicle\pages\vehicle-add\vehicle-add.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { BatteryModelService } from '../../../battery-model/services/battery-model.service';
import { BatteryModel } from '../../../battery-model/models/battery-model.model';

@Component({
  selector: 'app-vehicle-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-add.component.html',
  styleUrls: ['./vehicle-add.component.css'],
})
export class VehicleAddComponent implements OnInit {
  private api = inject(VehicleService);
  private batteryApi = inject(BatteryModelService);
  private router = inject(Router);

  form = {
    vin: '',
    make: '',
    model: '',
    year: '',
    batteryModelPreferenceId: null as number | null,
  };

  batteryModels: BatteryModel[] = [];

  loading = false;
  success = false;
  errorMessage = '';

  ngOnInit() {
    this.batteryApi.getAll().subscribe({
      next: (res) => (this.batteryModels = res),
      error: () => (this.errorMessage = 'Không tải được danh sách model pin.'),
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

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      vin: this.form.vin,
      make: this.form.make,
      model: this.form.model,
      year: Number(this.form.year),
      batteryModelPreferenceId: Number(this.form.batteryModelPreferenceId),
    };

    this.api.create(payload).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/vehicles']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Không thể thêm xe.';
        this.loading = false;
      },
    });
  }
}
