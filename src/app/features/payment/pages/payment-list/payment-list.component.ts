// src\app\features\payment\pages\payment-list\payment-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // ← thêm dòng này
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],          
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css'],
})
export class PaymentListComponent implements OnInit {
  private api = inject(PaymentService);

  payments = signal<Payment[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  sortBy = signal<'createdDesc' | 'createdAsc'>('createdDesc');

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.loading.set(true);

    this.api.getMine().subscribe({
      next: (res) => {
        this.payments.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Không tải được lịch sử thanh toán.');
        this.loading.set(false);
      },
    });
  }

  onSortChange(v: any) {       
    this.sortBy.set(v as 'createdDesc' | 'createdAsc');
  }

  toLocal(iso?: string | null): string {
    if (!iso) return '—';
    const norm = iso.endsWith('Z') ? iso : iso + 'Z';
    return new Date(norm).toLocaleString('vi-VN', { hour12: false });
  }

  view = computed(() => {
    const arr = [...this.payments()];
    const sort = this.sortBy();

    arr.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sort === 'createdDesc' ? tb - ta : ta - tb;
    });

    return arr;
  });

  getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      case 'cancelled': return 'status-cancelled';
      case 'refunded': return 'status-refunded';
      default: return 'status-default';
    }
  }

  getIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'reservationdeposit': return 'account_balance_wallet';
      case 'swapfee': return 'swap_horiz';
      case 'penalty': return 'report';
      default: return 'payments';
    }
  }

  formatType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }
}
