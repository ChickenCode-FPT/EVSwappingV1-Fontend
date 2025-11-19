import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/payments`;

  /** Lấy tất cả payment của user hiện tại */
  getMine(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/me`);
  }

  /** Lấy payment theo ID */
  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/${id}`);
  }
}
