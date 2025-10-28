// src\app\features\station\services\station.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Station } from '../models/station.model';
import { RouteResponse, VehicleProfile } from '../models/osrm.types';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StationApi {
  private baseUrl = `${environment.apiBase}/Station`;

  constructor(private http: HttpClient) {}

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.baseUrl}`);
  }

  getNearestStation(
    lng: number,
    lat: number,
    profile: VehicleProfile = environment.osrm.defaultProfile
  ): Observable<Station> {
    return this.http.get<Station>(`${this.baseUrl}/nearest`, {
      params: { lng, lat, profile } as any,
    });
  }

  getRouteToStation(
    stationId: number,
    lng: number,
    lat: number,
    profile: VehicleProfile = environment.osrm.defaultProfile
  ): Observable<RouteResponse> {
    return this.http.get<RouteResponse>(`${this.baseUrl}/${stationId}/route`, {
      params: { lng, lat, profile } as any,
    });
  }

  getStationsWithDistance(lng: number, lat: number): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.baseUrl}/with-distance`, {
      params: { lng, lat } as any,
    });
  }
}
