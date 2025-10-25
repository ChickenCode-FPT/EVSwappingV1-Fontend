import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiBase}/payments`;

  constructor(private http: HttpClient) {}

  getFilteredPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filter`);
  }

  getFilteredPayment(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}`);
  }

  updatePayment(payment: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${payment.paymentId}`, payment);
  }
}
