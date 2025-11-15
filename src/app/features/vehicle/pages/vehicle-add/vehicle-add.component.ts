import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-add.component.html',
  styleUrls: ['./vehicle-add.component.css'],
})
export class VehicleAddComponent {
  private api = inject(VehicleService);
  private router = inject(Router);

  form = {
    vin: '',
    make: '',
    model: '',
    year: '',
    batteryModelPreferenceId: null,
  };

  loading = false;
  success = false;
  errorMessage = '';

  submit() {
    this.loading = true;
    this.errorMessage = '';

    const payload = {
      vin: this.form.vin,
      make: this.form.make,
      model: this.form.model,
      year: this.form.year ? Number(this.form.year) : undefined,
      batteryModelPreferenceId: this.form.batteryModelPreferenceId
        ? Number(this.form.batteryModelPreferenceId)
        : null,
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
