// src\app\features\reservations\pages\reservations-page\reservations-page.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { ReservationDto } from '../../models/reservation.types';
import { HttpClientModule } from '@angular/common/http';
import { ReservationFormComponent } from '../../components/reservation-form/reservation-form.component';
import { isoToDatetimeLocal } from '../../../../shared/time.utils';

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReservationFormComponent],
  templateUrl: './reservations-page.component.html',
  styleUrls: ['./reservations-page.component.css']
})
export class ReservationsPageComponent {
  private api = inject(ReservationService);

  @Input() userId = '';         // bind từ auth/parent
  @Input() defaultStationId?: number;
  @Input() defaultBatteryModelId?: number | null;

  loading = false;
  items: ReservationDto[] = [];
  errorMsg = '';
  infoMsg = '';

  ngOnInit() {
    if (this.userId) this.fetch();
  }

  fetch() {
    this.loading = true;
    this.errorMsg = '';
    this.api.getByUser(this.userId).subscribe({
      next: (res) => { this.items = res; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.detail || 'Không tải được danh sách đặt lịch';
      }
    });
  }

  onCreated(res: ReservationDto) {
    this.infoMsg = `Đã tạo lịch #${res.reservationId}`;
    this.fetch();
  }

  cancel(item: ReservationDto) {
    if (!confirm(`Hủy đặt lịch #${item.reservationId}?`)) return;
    this.api.cancel(item.reservationId, this.userId).subscribe({
      next: () => {
        this.infoMsg = `Đã hủy #${item.reservationId}`;
        this.fetch();
      },
      error: (err) => {
        alert(err?.error?.detail || 'Hủy thất bại');
      }
    });
  }

  toLocal(dt?: string | null): string {
    return dt ? isoToDatetimeLocal(dt).replace('T', ' ') : '—';
  }

  badgeClass(status: ReservationDto['status']) {
    return {
      Pending: 'badge pending',
      Completed: 'badge success',
      Expired: 'badge muted',
      Cancelled: 'badge danger'
    }[status] || 'badge';
  }
}
