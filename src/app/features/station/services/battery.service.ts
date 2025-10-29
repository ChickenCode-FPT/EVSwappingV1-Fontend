import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';
import { BatteryDto } from '../models/battery.types';

@Injectable({ providedIn: 'root' })
export class BatteryService {
  private base = `${environment.apiBase}/battery`;

  constructor(private http: HttpClient) {}

  getAvailableByStation(stationId: number, batteryModelId?: number | null): Observable<BatteryDto[]> {
    let params = new HttpParams().set('stationId', stationId);
    if (batteryModelId != null) params = params.set('batteryModelId', batteryModelId);
    return this.http.get<BatteryDto[]>(`${this.base}/available`, { params });
  }

  getAvailableModelsSummary(stationId: number) {
    return this.getAvailableByStation(stationId).pipe(
      map(list => {
        const mapCount = new Map<number, number>();
        for (const b of list) {
          mapCount.set(b.batteryModelId, (mapCount.get(b.batteryModelId) ?? 0) + 1);
        }
        return [...mapCount.entries()].map(([id, count]) => ({ id, count }));
      })
    );
  }
}
