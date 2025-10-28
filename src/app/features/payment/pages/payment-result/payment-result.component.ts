// src\app\features\payment\pages\payment-result\payment-result.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css'],
})
export class PaymentResultComponent implements OnInit {
  message = '';
  success = false;
  loading = true;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const responseCode = params['vnp_ResponseCode'];
    const orderCode = params['vnp_TxnRef'];
    const amount = params['vnp_Amount'] ? Number(params['vnp_Amount']) / 100 : 0;
    const secureHash = params['vnp_SecureHash'];
    const rawQuery = window.location.search.substring(1);

    const dto = {
      OrderCode: orderCode,
      Status: responseCode === '00' ? 'Paid' : 'Cancelled',
      Amount: amount,
      RawData: rawQuery,
      Signature: secureHash,
    };

    this.success = dto.Status === 'Paid';
    this.message = this.success
      ? 'Thanh toán thành công! Đang xác nhận với hệ thống...'
      : `Thanh toán thất bại (mã: ${responseCode}).`;
    this.loading = this.success;

    if (this.success) {
      this.http.post(`${environment.apiBase}/payments/update-status`, dto).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.message =
            res?.message || 'Thanh toán thành công! Lịch đặt của bạn đã được xác nhận.';
          setTimeout(() => this.router.navigate(['/reservations']), 3000);
        },
        error: (err) => {
          console.error('[PaymentResult] Update failed', err);
          this.loading = false;
          this.message = 'Thanh toán thành công nhưng hệ thống chưa cập nhật được trạng thái.';
        },
      });
    } else {
      this.loading = false;
    }
  }
  goToReservations() {
    this.router.navigate(['/reservations']);
  }
}
