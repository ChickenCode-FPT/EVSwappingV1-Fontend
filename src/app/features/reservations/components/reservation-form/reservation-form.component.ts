// src\app\features\reservations\components\reservation-form\reservation-form.component.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { CreateReservationRequest, ReservationDto } from '../../models/reservation.types';
import { StationSelectComponent } from '../station-select/station-select.component';
import { VehicleSelectComponent } from '../vehicle-select/vehicle-select.component';

/**
 * Convert input datetime-local → chuẩn ISO local (không timezone)
 * Example:
 * "2025-11-19T11:20" → "2025-11-19T11:20:00"
 */
function localDatetimeToIso(datetimeLocal: string): string {
  return datetimeLocal + ":00";
}

/**
 * Giữ nguyên thời gian người dùng nhập, chỉ chuẩn hóa format.
 * KHÔNG làm tròn xuống/up để tránh sai lệch.
 * Nếu bạn muốn làm tròn theo 15 phút, tôi có thể gửi version riêng.
 */
function snapTo15Minutes(localIso: string): string {
  return localIso; // giữ nguyên – đúng nhất với người dùng
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StationSelectComponent,
    VehicleSelectComponent,
  ],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css'],
})
export class ReservationFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ReservationService);

  @Input() stationId?: number;
  @Input() vehicleId?: number | null;
  @Output() created = new EventEmitter<ReservationDto>();

  submitting = false;
  infoMsg = '';
  errorMsg = '';

  form = this.fb.group({
    stationId: [null as number | null, Validators.required],
    vehicleId: [null as number | null],
    reservedFromLocal: ['', Validators.required],
    reservedToLocal: ['', Validators.required],
  });

  ngOnInit() {
    if (this.stationId != null) {
      this.form.patchValue({ stationId: this.stationId });
    }
    if (this.vehicleId !== undefined) {
      this.form.patchValue({ vehicleId: this.vehicleId });
    }
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    this.errorMsg = '';
    this.infoMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // Không dùng UTC – giữ nguyên giờ người dùng nhập
    const fromIso = snapTo15Minutes(localDatetimeToIso(v.reservedFromLocal!));
    const toIso = snapTo15Minutes(localDatetimeToIso(v.reservedToLocal!));

    // Validate độ dài thời gian
    const spanMs = new Date(toIso).getTime() - new Date(fromIso).getTime();
    if (spanMs <= 0 || spanMs > 90 * 60 * 1000) {
      this.errorMsg = 'Khoảng thời gian phải > 0 và ≤ 90 phút.';
      return;
    }

    const payload: CreateReservationRequest = {
      stationId: v.stationId!,
      vehicleId: v.vehicleId ?? null,
      reservedFrom: fromIso,
      reservedTo: toIso,
    };

    this.submitting = true;

    this.api
      .create(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          this.created.emit(res);
          this.infoMsg = `Đã tạo lịch #${res.reservationId} (status: ${res.status}).`;
          this.form.markAsPristine();
        },
        error: (err) => {
          const detail =
            err?.error?.detail || err?.error?.title || err?.message || 'Đặt lịch thất bại';
          this.errorMsg = detail;
        },
      });
  }
}
