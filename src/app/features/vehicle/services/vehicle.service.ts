// src\app\features\vehicle\services\vehicle.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/vehicle`;

  /** Lấy danh sách xe của user hiện tại */
  getMine(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/me`);
  }

  /** Lấy chi tiết xe */
  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${id}`);
  }
}
