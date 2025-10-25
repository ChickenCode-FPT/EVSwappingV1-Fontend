import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { TransactionFull } from '../../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class SwapTransactionService {
  private apiUrl = `${environment.apiUrl}/swapTransactions`;

  constructor(private http: HttpClient) {}

  getAllFullTransactions(): Observable<TransactionFull[]> {
    return this.http.get<TransactionFull[]>(`${this.apiUrl}/full`);
  }

    getFullTransactionById(id: number): Observable<TransactionFull> {
    return this.http.get<TransactionFull>(`${this.apiUrl}/full/${id}`);
  }

  updateTransactionStatus(id: number, status: string) {
  return this.http.put(`${this.apiUrl}/${id}`, { status });
}

}
