import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SwapTransactionService } from '../services/swapTransaction-service';
import { PaymentService } from '../services/payment-service';
import { TransactionFull } from '../../models/transaction.model';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-battery-transaction',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './battery-transaction.html',
  styleUrls: ['./battery-transaction.css']
})
export class BatteryTransaction implements OnInit {
  private transactionService = inject(SwapTransactionService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  transactions = signal<TransactionFull[]>([]);
  loading = signal<boolean>(false);
  sortOrder = signal<'asc' | 'desc'>('desc');
  searchTerm = signal<string>('');

  filteredPayments = signal<any[]>([]);

  async ngOnInit() {
    await this.loadTransactions();
    await this.loadFilteredPayments();
  }

  async loadTransactions() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.transactionService.getAllFullTransactions());
      const stationId = localStorage.getItem('stationId');

      if (stationId) {
        const filteredTransactions = data.filter(transaction => transaction.station?.stationId.toString() === stationId);
        this.transactions.set(filteredTransactions);
      } else {
        console.warn('⚠️ StationId không có trong localStorage');
        this.transactions.set([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadFilteredPayments() {
    try {
      const payments = await firstValueFrom(this.paymentService.getFilteredPayments());
      this.filteredPayments.set(payments);

      const transactionsWithPayments = this.transactions().map(transaction => {
        const payment = payments.find(p => p.swapTransactionId === transaction.swapTransactionId);
        return { ...transaction, payment };
      });

      this.transactions.set(transactionsWithPayments);
    } catch (err) {
      console.error('Lỗi khi tải thanh toán:', err);
    }
  }

  // Filter + sort logic
  filteredTransactions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    let list = this.transactions().filter(t =>
      t.station?.name?.toLowerCase().includes(term) ||
      t.reservation?.reservationId.toString().includes(term) ||
      t.swapStatus.toLowerCase().includes(term)
    );

    return list.sort((a, b) => {
      const da = new Date(a.reservation?.reservedFrom ?? '');
      const db = new Date(b.reservation?.reservedFrom ?? '');
      return this.sortOrder() === 'asc' ? da.getTime() - db.getTime() : db.getTime() - da.getTime();
    });
  });

  toggleSort() {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
  }

  // Điều hướng
  goToDetail(id: number) {
    this.router.navigate(['staff/battery/transaction', id]);
  }

  confirmSwap(id: number, status: string) {
    if (status === 'Completed') return;
    this.router.navigate(['staff/transactions/confirm', id]);
  }
}
