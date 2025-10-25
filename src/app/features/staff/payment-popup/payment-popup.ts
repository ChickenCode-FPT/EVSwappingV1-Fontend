import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../services/payment-service';

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-popup.html',
  styleUrls: ['./payment-popup.css']
})
export class PaymentPopup {
  @Input() payment: any;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<any>();

  editablePayment: any = {};

  constructor(private paymentService: PaymentService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payment'] && this.payment) {
      this.editablePayment = JSON.parse(JSON.stringify(this.payment));

      const now = new Date();
      this.editablePayment.paidAt = now.toISOString().slice(0, 16);
      this.editablePayment.createdAt = now.toISOString().slice(0, 16);
    }
  }

  updatePayment() {
    const payload = {
      paymentId: this.editablePayment.paymentId,
      swapTransactionId: this.editablePayment.swapTransactionId,
      userId: this.editablePayment.userId,
      amount: this.editablePayment.amount,
      currency: this.editablePayment.currency,
      method: this.editablePayment.method,
      status: this.editablePayment.status,
      transactionRef: this.editablePayment.transactionRef,
      paidAt: new Date(this.editablePayment.paidAt).toISOString(),
      createdAt: new Date(this.editablePayment.createdAt).toISOString()
    };

    this.paymentService.updatePayment(payload).subscribe({
      next: (res) => {
        alert('Payment updated successfully!');
        this.updated.emit(res);
        this.close.emit();
      },
      error: (err) => console.error(err)
    });
  }

  cancel() {
    this.close.emit();
  }
}
