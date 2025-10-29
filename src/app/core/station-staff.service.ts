import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StationDto {
  stationId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  phone: string;
  status: number;
  availableBatteries: number;
  distanceKm: number;
  durationMin: number;
}

export interface AssignStaffDto {
  userId: string;
  role: string;
}

export interface StationStaffDto {
  stationStaffId: number;
  stationId: number;
  stationName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  assignedAt: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StationStaffService {
  private apiUrl = 'https://localhost:7292/api/Station';
  private apiUrl1 = 'https://localhost:7292/api/AdminStationsStaff';
  private apiUrl2 = 'https://localhost:7292/api/AdminStationsStaff/by-name';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // Get all stations
  getAllStations(): Observable<StationDto[]> {
    return this.http.get<StationDto[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Assign staff to station
  assignStaff(stationId: number, dto: AssignStaffDto): Observable<any> {
    return this.http.post(
      `${this.apiUrl1}/${stationId}/assign-staff`,
      dto,
      { headers: this.getAuthHeaders() }
    );
  }

  //  staff
  deactivateStaff(stationStaffId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl1}/staff/${stationStaffId}/deactivate`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  getStationStaff(stationCode: string): Observable<StationStaffDto[]> {
    return this.http.get<StationStaffDto[]>(
      `${this.apiUrl2}/${stationCode}/staffs`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAllStationStaff(): Observable<StationStaffDto[]> {
    return this.http.get<StationStaffDto[]>(
      `${this.apiUrl}/staff/all`,
      { headers: this.getAuthHeaders() }
    );
  }
}