import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { CreateReservationRequest, ReservationDto } from '../../models/reservation.types';
import { HttpClientModule } from '@angular/common/http';
import { datetimeLocalToIso } from '../../../../shared/time.utils';
import { finalize } from 'rxjs';

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

  /** Truyền từ ngoài vào (nếu đã biết trạm/batteryModel) */
  @Input() userId = '';
  @Input() stationId?: number;
  @Input() batteryModelId?: number | null;

  /** Emit khi tạo xong */
  @Output() created = new EventEmitter<ReservationDto>();

  submitting = false;
  errorMsg = '';

  form = this.fb.group({
    userId: ['', [Validators.required]],
    stationId: [null as number | null, [Validators.required]],
    batteryModelId: [null as number | null],
    scheduledAtLocal: [''], // dùng cho datetime-local
    notes: [''],
  });

  ngOnInit() {
    if (this.userId) this.form.patchValue({ userId: this.userId });
    if (this.stationId != null) this.form.patchValue({ stationId: this.stationId });
    if (this.batteryModelId !== undefined) this.form.patchValue({ batteryModelId: this.batteryModelId });
  }

  get f() { return this.form.controls; }

  submit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const payload: CreateReservationRequest = {
      userId: v.userId!,
      stationId: v.stationId!,
      batteryModelId: v.batteryModelId ?? null,
      scheduledAt: v.scheduledAtLocal ? datetimeLocalToIso(v.scheduledAtLocal) : null,
      notes: v.notes ?? null
    };

    this.submitting = true;
    this.api.create(payload)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (res) => this.created.emit(res),
        error: (err) => {
          const detail = err?.error?.detail || err?.error?.title || err?.message || 'Đặt lịch thất bại';
          this.errorMsg = detail;
        }
      });
  }
}
