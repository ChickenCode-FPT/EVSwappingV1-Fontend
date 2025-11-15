// src\app\features\vehicle\services\vehicle.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../models/vehicle.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/vehicle`;

  getMine(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/me`);
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${id}`);
  }

  create(req: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}`, req);
  }

  update(id: number, req: UpdateVehicleRequest): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.baseUrl}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
