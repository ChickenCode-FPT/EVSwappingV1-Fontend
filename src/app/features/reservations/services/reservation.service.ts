import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateReservationRequest, ReservationDto } from '../models/reservation.types';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private base = `${environment.apiBase}/reservation`;

  constructor(private http: HttpClient) {}

  create(payload: CreateReservationRequest): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(this.base, payload);
  }

  cancel(reservationId: number, userId: string): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete<void>(`${this.base}/${reservationId}`, { params });
  }

  getByUser(userId: string): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.base}/user/${encodeURIComponent(userId)}`);
  }
}
