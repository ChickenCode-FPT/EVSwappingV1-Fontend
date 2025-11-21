// src/app/features/station/services/battery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map, switchMap } from 'rxjs';
import { BatteryDto } from '../models/battery.types';
import { BatteryModel } from '../../battery-model/models/battery-model.model';

@Injectable({ providedIn: 'root' })
export class BatteryService {
  private base = `${environment.apiBase}/battery`;
  // private modelBase = `${environment.apiBase}/battery-model`;
private modelBase = `${environment.apiBase}/batteryModel`;

  private modelCache: BatteryModel[] | null = null;

  constructor(private http: HttpClient) {}

  getAvailableByStation(stationId: number, batteryModelId?: number | null): Observable<BatteryDto[]> {
    let params = new HttpParams().set('stationId', stationId);
    if (batteryModelId != null) params = params.set('batteryModelId', batteryModelId);
    return this.http.get<BatteryDto[]>(`${this.base}/available`, { params });
  }

  private loadAllModels(): Observable<BatteryModel[]> {
    if (this.modelCache) {
      return new Observable(o => {
        o.next(this.modelCache!);
        o.complete();
      });
    }

    return this.http.get<BatteryModel[]>(this.modelBase).pipe(
      map(list => {
        this.modelCache = list;
        return list;
      })
    );
  }

  getAvailableModelsSummary(stationId: number) {
    return this.getAvailableByStation(stationId).pipe(
      switchMap(batteries =>
        this.loadAllModels().pipe(
          map(models => {
            const countMap = new Map<number, number>();

            for (const b of batteries) {
              countMap.set(b.batteryModelId, (countMap.get(b.batteryModelId) ?? 0) + 1);
            }

            return [...countMap.entries()].map(([id, count]) => {
              const model = models.find(m => m.batteryModelId === id);

              return {
                id,
                displayName: model
                  ? `${model.manufacturer} ${model.modelCode}`
                  : `Model #${id}`,
                count,
              };
            });
          })
        )
      )
    );
  }
}
