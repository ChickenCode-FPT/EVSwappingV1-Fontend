import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BatteryModelService } from '../../services/battery-model.service';

@Component({
  selector: 'app-battery-model-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './battery-model-add.component.html',
  styleUrls: ['./battery-model-add.component.css'],
})
export class BatteryModelAddComponent {
  private api = inject(BatteryModelService);
  private router = inject(Router);

  form = {
    modelCode: '',
    manufacturer: '',
    capacityKwh: '',
    chemistry: '',
    compatibleVehicleTypes: '',
    reservationDepositFee: '',
  };

  error = '';

  submit() {
    if (!this.form.modelCode || !this.form.manufacturer) {
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc.';
      return;
    }

    const payload = {
      ...this.form,
      capacityKwh: Number(this.form.capacityKwh),
      reservationDepositFee: Number(this.form.reservationDepositFee),
    };

    this.api.create(payload).subscribe({
      next: () => this.router.navigate(['/battery-model']),
      error: () => (this.error = 'Không thể tạo model pin.'),
    });
  }
}
