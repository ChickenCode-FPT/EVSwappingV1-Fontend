// src/app/map/services/station.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Station } from '../models/station.model';
import { RouteResponse } from '../models/osrm.types';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StationApi {
  private baseUrl = `${environment.apiBase}/Station`;

  constructor(private http: HttpClient) {}

  /** Lấy tất cả trạm */
  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.baseUrl}`);
  }

  /**
   * Lấy trạm gần nhất từ vị trí hiện tại của user
   * Backend hiện trả về MỘT StationDto (không phải mảng).
   */
  getNearestStation(lng: number, lat: number): Observable<Station> {
    return this.http.get<Station>(`${this.baseUrl}/nearest`, {
      params: { lng, lat } as any,
    });
  }

  /** Lấy route từ vị trí hiện tại đến stationId */
  getRouteToStation(stationId: number, lng: number, lat: number): Observable<RouteResponse> {
    return this.http.get<RouteResponse>(`${this.baseUrl}/${stationId}/route`, {
      params: { lng, lat } as any,
    });
  }
}
