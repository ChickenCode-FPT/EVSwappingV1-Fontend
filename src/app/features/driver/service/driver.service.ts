import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterDriverRequest, RegisterDriverResponse } from '../models/driver.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/driver`;

  registerDriver(data: RegisterDriverRequest): Observable<RegisterDriverResponse> {
    return this.http.post<RegisterDriverResponse>(`${this.baseUrl}/register`, data);
  }

  getMyDriverInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }
}
