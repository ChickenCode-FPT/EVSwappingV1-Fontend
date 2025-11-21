// src\app\features\battery-model\services\battery-model.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BatteryModel } from '../models/battery-model.model';

@Injectable({ providedIn: 'root' })
export class BatteryModelService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/batteryModel`;

  getAll(): Observable<BatteryModel[]> {
    return this.http.get<BatteryModel[]>(this.baseUrl);
  }

  getById(id: number): Observable<BatteryModel> {
    return this.http.get<BatteryModel>(`${this.baseUrl}/${id}`);
  }

  create(model: Partial<BatteryModel>): Observable<any> {
    return this.http.post(this.baseUrl, model);
  }

  update(id: number, model: Partial<BatteryModel>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, model);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
