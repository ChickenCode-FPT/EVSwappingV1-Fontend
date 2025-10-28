// src\app\features\reservations\pages\reservations-page\reservations-page.component.ts
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ReservationService } from '../../services/reservation.service';
import { ReservationDto } from '../../models/reservation.types';
import { ReservationFormComponent } from '../../components/reservation-form/reservation-form.component';

type Status = ReservationDto['status'];

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReservationFormComponent],
  templateUrl: './reservations-page.component.html',
  styleUrls: ['./reservations-page.component.css'],
})
export class ReservationsPageComponent implements OnInit, OnDestroy {
  private api = inject(ReservationService);
  private subs = new Subscription();

  items = signal<ReservationDto[]>([]);
  loading = signal(false);
  infoMsg = signal('');
  errorMsg = signal('');

  defaultStationId?: number;
  defaultVehicleId?: number | null;

  q = signal('');
  status = signal<Status | 'All'>('All');
  sortBy = signal<'startAsc' | 'startDesc' | 'status'>('startDesc');

  confirmOpen = signal(false);
  itemToCancel = signal<ReservationDto | null>(null);
  cancellingIds: WritableSignal<Set<number>> = signal(new Set<number>());

  private normalizeStatus(s?: string | null) {
    return (s ?? '').trim().toLowerCase();
  }
  isPendingStatus(s?: string | null) {
    return this.normalizeStatus(s) === 'pending';
  }

  view = computed(() => {
    const text = this.q().trim().toLowerCase();
    const st = this.status();
    const sort = this.sortBy();
    let arr = [...this.items()];

    if (st !== 'All') {
      arr = arr.filter((x) => this.normalizeStatus(x.status) === this.normalizeStatus(st));
    }
    if (text) {
      arr = arr.filter(
        (x) =>
          String(x.stationId).includes(text) ||
          String(x.reservationId).includes(text) ||
          (x.reservedBatteryModelId != null && String(x.reservedBatteryModelId).includes(text))
      );
    }
    switch (sort) {
      case 'startAsc':
        arr.sort((a, b) => +new Date(a.reservedFrom) - +new Date(b.reservedFrom));
        break;
      case 'startDesc':
        arr.sort((a, b) => +new Date(b.reservedFrom) - +new Date(a.reservedFrom));
        break;
      case 'status': {
        const order = ['pending', 'completed', 'cancelled', 'expired'];
        arr.sort(
          (a, b) =>
            order.indexOf(this.normalizeStatus(a.status)) -
            order.indexOf(this.normalizeStatus(b.status))
        );
        break;
      }
    }
    return arr;
  });

  ngOnInit(): void {
    this.reload();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  reload(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.cancellingIds.set(new Set<number>());

    const s = this.api.getMine().subscribe({
      next: (data) => {
        this.items.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.detail || err?.error?.title || 'Không tải được danh sách.');
        this.loading.set(false);
      },
    });
    this.subs.add(s);
  }

  onCreated(res: ReservationDto): void {
    this.infoMsg.set(`Đã tạo lịch #${res.reservationId}.`);
    this.reload();
  }

  askCancel(item: ReservationDto) {
    if (!this.isPendingStatus(item.status)) return;
    this.itemToCancel.set(item);
    this.confirmOpen.set(true);
  }

  closeConfirm() {
    this.confirmOpen.set(false);
    this.itemToCancel.set(null);
  }

  doCancel() {
    const item = this.itemToCancel();
    if (!item) return;

    const s1 = new Set(this.cancellingIds());
    s1.add(item.reservationId);
    this.cancellingIds.set(s1);

    const sub = this.api.cancel(item.reservationId).subscribe({
      next: () => {
        this.infoMsg.set(`Đã hủy lịch #${item.reservationId}.`);
        this.closeConfirm();
        this.reload();
      },
      error: (err) => {
        const msg = err?.error?.detail || err?.error?.title || 'Hủy lịch thất bại.';
        this.errorMsg.set(msg);
        this.closeConfirm();
      },
    });

    this.subs.add(sub);
    sub.add(() => {
      const s2 = new Set(this.cancellingIds());
      s2.delete(item.reservationId);
      this.cancellingIds.set(s2);
    });
  }

  onStatusChange(v: 'All' | Status) {
    this.status.set(v);
  }
  onSortChange(v: 'startAsc' | 'startDesc' | 'status') {
    this.sortBy.set(v);
  }
  openPayment(res: ReservationDto) {
    if (!res.paymentCheckoutUrl) return;
    window.location.href = res.paymentCheckoutUrl;
  }

  badgeClass(status: Status): string {
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'pending':
        return 'badge badge--pending';
      case 'completed':
        return 'badge badge--success';
      case 'cancelled':
        return 'badge badge--danger';
      case 'expired':
        return 'badge badge--warn';
      default:
        return 'badge';
    }
  }

  toLocal(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', { hour12: false });
  }

  trackById = (_: number, it: ReservationDto) => it.reservationId;
}
