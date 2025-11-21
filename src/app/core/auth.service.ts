// src\app\core\auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API = `${environment.apiBase}/Auth`;

export interface RegisterUserCommand {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface TokenInfo {
  token: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  requiresTwoFactor: boolean;
}

export interface LoginResponseDto {
  token: TokenInfo;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiBase;
  constructor(private http: HttpClient) {}

  register(model: RegisterUserCommand): Observable<{ token: string } | string> {
    return this.http.post<{ token: string } | string>(`${API}/register`, model);
  }

  login(model: { email: string; password: string }): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${API}/login`, model);
  }

  forgotPassword(email: string) {
    return this.http.post(`${API}/forgot-password`, { email });
  }

  resetPassword(email: string, token: string, newPassword: string) {
    return this.http.post(`${API}/reset-password`, { email, token, newPassword });
  }

  updatePhone(email: string, phoneNumber: string) {
    return this.http.post<LoginResponseDto>(`${API}/update-phone`, { email, phoneNumber });
  }

  get2FASetup(email: string) {
    return this.http.get(`${API}/2fa/setup`, { params: { email } });
  }

  enable2FA(email: string, token: string) {
    return this.http.post(`${API}/2fa/enable`, { email, token });
  }

  verifyTwoFactor(email: string, token: string) {
    return this.http.post<LoginResponseDto>(`${API}/2fa/verify`, { email, token });
  }

  disable2FA(data: { email: string }) {
    return this.http.post(`${API}/disable-2fa`, data);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getFullname(): string | null {
    return localStorage.getItem('fullname');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiry');
    localStorage.removeItem('fullname');
    localStorage.removeItem('roles');
    localStorage.removeItem('2faEmail');
    localStorage.removeItem('staff_fid');
    localStorage.removeItem('staffEmail');
    localStorage.removeItem('stationId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? roles.split(',') : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
  getStaffInfo(userId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/AdminStationsStaff/${userId}`);
  }
}
