import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApexChartData,
  EcommerceMetrics,
  HeatmapData,
} from '../models/statistic.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/v1/statistics`;

  getEcommerceMetrics(): Observable<EcommerceMetrics> {
    return this.http.get<EcommerceMetrics>(`${this.apiUrl}/ecommerce-metrics`);
  }

  getChartData(): Observable<ApexChartData> {
    return this.http.get<ApexChartData>(`${this.apiUrl}/chart-data`);
  }

  getHeatmapData(): Observable<HeatmapData> {
    return this.http.get<HeatmapData>(`${this.apiUrl}/heatmap-data`);
  }
}
