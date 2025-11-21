import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApexChartData, EcommerceMetrics, HeatmapData } from '../models/statistic.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/Statistic`;

  getEcommerceMetrics(): Observable<EcommerceMetrics> {
    return this.http.get<EcommerceMetrics>(`${this.apiUrl}/ecommerce-metrics`);
  }

  getTotalSwaps(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<any>(`${this.apiUrl}/swap/total`, { params });
  }

  getTotalRevenue(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<any>(`${this.apiUrl}/revenue/total`, { params });
  }

  getChartData(startDate: Date, endDate: Date, period: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString())
      .set('period', period);
    return this.http.get<any>(`${this.apiUrl}/revenue`, { params });
  }

  getBatterySwapData(startDate: Date, endDate: Date, period: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString())
      .set('period', period);
    return this.http.get<any>(`${this.apiUrl}/swap`, { params });
  }

  getHeatmapData(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<any>(`${this.apiUrl}/swap/peak-hours`, { params });
  }
}
