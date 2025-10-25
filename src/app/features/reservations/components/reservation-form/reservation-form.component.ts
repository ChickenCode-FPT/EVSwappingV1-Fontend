// src\app\features\reservations\components\reservation-form\reservation-form.component.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';

import { ReservationService } from '../../services/reservation.service';
import { CreateReservationRequest, ReservationDto } from '../../models/reservation.types';

// helper: chuyển "yyyy-MM-ddTHH:mm" (input datetime-local) -> ISO (UTC)
function localDatetimeToIso(datetimeLocal: string): string {
  // new Date(datetimeLocal) hiểu là local time, toISOString() convert sang UTC ISO
  return new Date(datetimeLocal).toISOString();
}

// (tuỳ chọn) snap phút về block 15'
function snapTo15Minutes(iso: string): string {
  const d = new Date(iso);
  const m = d.getUTCMinutes();
  const snapped = Math.floor(m / 15) * 15;
  d.setUTCMinutes(snapped, 0, 0);
  return d.toISOString();
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ReservationService);

  /** Nếu đã biết trạm/xe (bind từ ngoài) */
  @Input() stationId?: number;
  @Input() vehicleId?: number | null;

  /** Emit khi tạo xong */
  @Output() created = new EventEmitter<ReservationDto>();

  submitting = false;
  errorMsg = '';
  infoMsg = '';

  form = this.fb.group({
    stationId: [null as number | null, [Validators.required]],
    vehicleId: [null as number | null],         // optional
    reservedFromLocal: ['', [Validators.required]], // input datetime-local
    reservedToLocal:   ['', [Validators.required]], // input datetime-local
  });

  ngOnInit() {
    if (this.stationId != null) this.form.patchValue({ stationId: this.stationId });
    if (this.vehicleId !== undefined) this.form.patchValue({ vehicleId: this.vehicleId });
  }

  get f() { return this.form.controls; }

  submit() {
    this.errorMsg = '';
    this.infoMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // convert sang ISO (UTC), có thể snap block 15' để khớp BE
    const fromIso = snapTo15Minutes(localDatetimeToIso(v.reservedFromLocal!));
    const toIso   = snapTo15Minutes(localDatetimeToIso(v.reservedToLocal!));

    // (FE guard) giới hạn tối đa 90 phút như BE
    const spanMs = new Date(toIso).getTime() - new Date(fromIso).getTime();
    if (spanMs <= 0 || spanMs > 90 * 60 * 1000) {
      this.errorMsg = 'Khoảng thời gian phải > 0 và ≤ 90 phút.';
      return;
    }

    const payload: CreateReservationRequest = {
      stationId: v.stationId!,
      vehicleId: v.vehicleId ?? null,
      reservedFrom: fromIso,
      reservedTo: toIso
    };

    this.submitting = true;
    this.api.create(payload)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (res) => {
          this.created.emit(res);
          this.infoMsg = `Đã tạo lịch #${res.reservationId} (status: ${res.status}).`;
          this.form.markAsPristine();
        },
        error: (err) => {
          const detail = err?.error?.detail || err?.error?.title || err?.message || 'Đặt lịch thất bại';
          this.errorMsg = detail;
        }
      });
  }
}
