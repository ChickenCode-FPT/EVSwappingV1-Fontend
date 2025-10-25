// src\app\features\reservations\services\reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  cancel(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${reservationId}`);
  }

  getMine(): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.base}/me`);
  }
}
