import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css'],
})
export class PaymentListComponent implements OnInit {
  private api = inject(PaymentService);

  payments = signal<Payment[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.loading.set(true);

    this.api.getMine().subscribe({
      next: (res) => {
        this.payments.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Không tải được lịch sử thanh toán.');
        this.loading.set(false);
      },
    });
  }

  getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'cancelled':
        return 'status-cancelled';
      case 'refunded':
        return 'status-refunded';
      default:
        return 'status-default';
    }
  }

  getIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'reservationdeposit':
        return 'account_balance_wallet';
      case 'swapfee':
        return 'swap_horiz';
      case 'penalty':
        return 'report';
      default:
        return 'payments';
    }
  }

  formatType(type: string): string {
    return type
      .replace(/([A-Z])/g, ' $1') // thêm khoảng trắng trước chữ viết hoa
      .trim(); // xóa khoảng trắng đầu cuối
  }
}
