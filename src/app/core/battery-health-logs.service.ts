import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BatteryHealthLog {
  batteryHealthLogId: number;
  serialNumber?: string;
  batteryId: number;
  recordedAt: Date;
  soH: number;
  cycleCount: number;
  temperature: number;
  notes?: string;
}


@Injectable({
  providedIn: 'root'
})
export class BatteryHealthLogService {
  private apiUrl = 'https://localhost:7292/api/BatteryHealthLogs'; // đổi URL nếu port khác

  constructor(private http: HttpClient) {}

  getAll(): Observable<BatteryHealthLog[]> {
    return this.http.get<BatteryHealthLog[]>(this.apiUrl);
  }

  add(log: BatteryHealthLog): Observable<any> {
    return this.http.post(this.apiUrl, log);
  }

  update(id: number, log: BatteryHealthLog): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, log);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
