import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { SwapTransactionService } from '../services/swapTransaction-service';
import { BatteryService } from '../services/battery-service';
import { PaymentService } from '../services/payment-service';
import { PaymentPopup } from '../payment-popup/payment-popup';

@Component({
  selector: 'app-battery-transaction-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PaymentPopup
  ],
  templateUrl: './battery-transaction-detail.html',
  styleUrls: ['./battery-transaction-detail.css']
})
export class BatteryTransactionDetail implements OnInit {
  transaction: any;
  outgoingBattery: any;
  incomingBattery: any;
  payment: any;
  loading = true;
  mode: 'view' | 'confirm' = 'view';

  // popup state
  showPaymentPopup = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private swapService: SwapTransactionService,
    private batteryService: BatteryService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const routeData = this.route.snapshot.data;
    this.mode = routeData['mode'] || 'view';

    if (id) this.loadTransaction(+id);
  }

  async loadTransaction(id: number) {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.swapService.getFullTransactionById(id));
      this.transaction = res;
      await this.loadBatteries(res);
      await this.loadPayment(res.swapTransactionId);
    } catch (err) {
      console.error('Error loading transaction:', err);
    } finally {
      this.loading = false;
    }
  }

  private async loadBatteries(res: any) {
    const tasks: Promise<any>[] = [];

    if (res.outgoingBatteryId) {
      tasks.push(
        firstValueFrom(this.batteryService.getBatteryById(res.outgoingBatteryId)).then(
          (data) => (this.outgoingBattery = data)
        )
      );
    }

    if (res.incomingBatteryId) {
      tasks.push(
        firstValueFrom(this.batteryService.getBatteryById(res.incomingBatteryId)).then(
          (data) => (this.incomingBattery = data)
        )
      );
    }

    await Promise.all(tasks);
  }

  private async loadPayment(transactionId: number) {
    try {
      this.payment = await firstValueFrom(this.paymentService.getFilteredPayment(transactionId));
    } catch (err) {
      console.warn('No payment found for transaction:', transactionId);
    }
  }

  openPaymentPopup() {
  if (this.payment) {
    const userId = this.payment.transcation?.customerUserId;

    if (!this.payment.userId && userId) {
      this.payment.userId = userId;
    }

    if (!this.payment.transactionRef && this.payment.transcation?.swapTransactionId) {
      this.payment.transactionRef = 'CASH-' + this.payment.transcation.swapTransactionId;
    }
  }

  this.showPaymentPopup = true;
}

  closePaymentPopup() {
    this.showPaymentPopup = false;
  }

  handlePaymentUpdated(updatedPayment: any) {
    this.payment = updatedPayment;
    this.showPaymentPopup = false;
    if (this.transaction?.swapTransactionId) {
    this.loadPayment(this.transaction.swapTransactionId);
  }
  }

  // ✅ Xác nhận swap
  confirmSwap() {
    if (this.transaction.swapStatus === 'Completed' || this.transaction.swapStatus === 'Cancelled') return;

    if (confirm('Are you sure to confirm this swap?')) {
      this.swapService.updateTransactionStatus(this.transaction.swapTransactionId, 'Completed').subscribe({
        next: () => {
          alert('Swap confirmed successfully!');
          this.transaction.swapStatus = 'Completed';
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ✅ Kiểm tra ẩn/hiện nút
  canShowConfirmButton() {
    return (
      this.mode === 'confirm' &&
      this.transaction.swapStatus !== 'Cancelled' &&
      this.transaction.swapStatus !== 'Completed'
    );
  }

  canShowPaymentButton() {
    console.log('--- Check payment visibility ---');
  console.log('Mode:', this.mode);
  console.log('Payment:', this.payment);
  console.log('Payment status:', this.payment?.status);
  console.log('Transaction status:', this.transaction?.swapStatus);
    return (
      this.mode === 'confirm' &&
      this.payment &&
      this.payment.status !== 'Completed' &&
      this.transaction.swapStatus !== 'Cancelled' &&
      this.transaction.swapStatus !== 'Completed'
    );
  }
}
