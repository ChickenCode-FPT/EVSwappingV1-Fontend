import { Injectable, inject } from '@angular/core'; // 👈 Import inject
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Battery, CreateBattery, UpdateStatusBattery } from '../../models/battery.model';


@Injectable({
  providedIn: 'root',
})
export class BatteryService {
  private http = inject(HttpClient);

  private api = environment.apiBase;

  constructor() { }

  getBatteries(): Observable<Battery[]> {
    return this.http.get<Battery[]>(`${this.api}/batteries`, { params: new HttpParams().set('pageSize', '1000') });
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
}