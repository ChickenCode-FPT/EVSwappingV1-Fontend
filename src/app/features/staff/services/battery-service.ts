// src/app/features/staff/services/battery-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Battery, CreateBattery, UpdateStatusBattery } from '../../models/battery.model';
import { BatteryDto } from '../../station/models/battery.types';

@Injectable({
  providedIn: 'root',
})
export class BatteryService {
  private http = inject(HttpClient);
  private api = environment.apiBase;
  private batteryApi = `${this.api}/Battery`;

  constructor() {}

  getBatteries(): Observable<Battery[]> {
    return this.http.get<Battery[]>(`${this.api}/batteries`, {
      params: new HttpParams().set('pageSize', '1000'),
    });
  }

  getBatteryById(batteryId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/battery/${batteryId}`);
  }

  addBattery(battery: CreateBattery): Observable<any> {
    return this.http.post(`${this.api}/batteries`, battery).pipe(
      catchError((err) => {
        console.error('addBattery error', err);
        return of(null);
      })
    );
  }

  updateStatus(payload: UpdateStatusBattery): Observable<any> {
    return this.http.put(`${this.api}/batteries/status`, payload);
  }

  getAvailableOutgoingBatteries(
    stationId: number,
    batteryModelId?: number | null
  ): Observable<BatteryDto[]> {
    const url = `${this.batteryApi}/stations/${stationId}/batteries/available-outgoing`;

    let params = new HttpParams();
    if (batteryModelId != null) {
      params = params.set('batteryModelId', batteryModelId.toString());
    }

    return this.http.get<BatteryDto[]>(url, { params });
  }

  getUserInUseBatteries(userId: string): Observable<BatteryDto[]> {
    const url = `${this.batteryApi}/users/${userId}/batteries/inuse`;
    return this.http.get<BatteryDto[]>(url);
  }
}
