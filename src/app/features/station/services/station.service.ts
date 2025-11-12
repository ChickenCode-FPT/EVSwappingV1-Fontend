// src\app\features\station\services\station.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Station } from '../models/station.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/station`;

  /** Lấy tất cả trạm */
  getAll(): Observable<Station[]> {
    return this.http.get<Station[]>(this.baseUrl);
  }

  /** Lấy chi tiết trạm theo ID */
  getById(id: number): Observable<Station> {
    return this.http.get<Station>(`${this.baseUrl}/${id}`);
  }

  /** Lấy trạm gần nhất (nếu có tọa độ người dùng) */
  getNearest(lng: number, lat: number): Observable<Station> {
    return this.http.get<Station>(`${this.baseUrl}/nearest?lng=${lng}&lat=${lat}`);
  }

  /** Lấy toàn bộ trạm có kèm khoảng cách & thời gian */
  getAllWithDistance(lng: number, lat: number): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.baseUrl}/with-distance?lng=${lng}&lat=${lat}`);
  }
}
