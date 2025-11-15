import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-edit.component.html',
  styleUrls: ['./vehicle-edit.component.css'],
})
export class VehicleEditComponent implements OnInit {
  private api = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vehicleId!: number;

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

  submit() {
    this.saving = true;
    this.errorMessage = '';

    const payload = {
      vehicleId: this.vehicleId,
      vin: this.form.vin,
      make: this.form.make,
      model: this.form.model,
      year: this.form.year ? Number(this.form.year) : undefined,
      batteryModelPreferenceId: this.form.batteryModelPreferenceId
        ? Number(this.form.batteryModelPreferenceId)
        : null,
    };

    this.api.update(this.vehicleId, payload).subscribe({
      next: () => {
        this.success = true;
        this.saving = false;

        setTimeout(() => {
          this.router.navigate(['/vehicles']);
        }, 1500);
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
