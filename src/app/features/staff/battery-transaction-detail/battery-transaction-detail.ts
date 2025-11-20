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
import { StaffService } from '../services/staff.service';


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

  showPaymentPopup = false;
  showConfirmSwapPopup = false;
  showMissingFacePopup = false;
  pendingReturnUrl: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private swapService: SwapTransactionService,
    private batteryService: BatteryService,
    private paymentService: PaymentService,
    private staffService: StaffService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadTransaction(+id);
    });

    this.route.queryParams.subscribe(params => {
      if (params['showPopup'] === 'true') {
        this.showConfirmSwapPopup = true;
      }
    });

    const routeData = this.route.snapshot.data;
    this.mode = routeData['mode'] || 'view';
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

  async confirmSwap() {
    if (this.transaction.swapStatus === 'Completed' || this.transaction.swapStatus === 'Cancelled') return;

    const cachedFid = localStorage.getItem('staff_fid');
    if (cachedFid) {
      this.showConfirmSwapPopup = true;
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const staff: any = await firstValueFrom(this.staffService.getStaffProfile(userId));

      if (!staff) {
        alert('Không lấy được thông tin nhân viên.');
        return;
      }

      if (!staff.fId) {
        this.pendingReturnUrl = `/staff/battery/transaction/${this.transaction?.swapTransactionId ?? ''}`;
        this.showMissingFacePopup = true;
        return;
      }

      localStorage.setItem('staff_fid', staff.fId);
      this.showConfirmSwapPopup = true;

    } catch (err) {
      console.error('Lỗi khi lấy profile staff:', err);
      alert('Có lỗi khi kiểm tra khuôn mặt.');
    }
  }

  onConfirmSwapPopup() {
    this.showConfirmSwapPopup = false;
    this.router.navigate(['staff/face/verify'], {
      queryParams: { swapTransactionId: this.transaction.swapTransactionId }
    });
  }

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

  goToAddFace() {
    this.showMissingFacePopup = false;
    this.router.navigate(['/staff/face/add'], {
      queryParams: { returnTo: this.pendingReturnUrl }
    });
  }

}
