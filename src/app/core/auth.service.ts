import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterUserCommand {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}
export interface LoginResponseDto {
 token: {
    token: string;
    refreshToken: string;
    refreshTokenExpiry: string;
  };
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7292/api/Auth'; 
  constructor(private http: HttpClient) {}

  register(model: RegisterUserCommand): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, model);
  }
  login(model: { email: string; password: string }): Observable<LoginResponseDto> {
  return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, model);
}

getToken(): string | null {
  return localStorage.getItem('token');
}

getFullname(): string | null {
  return localStorage.getItem('fullname');
}

isLoggedIn(): boolean {
  return !!this.getToken();
  console.log(this.getToken());
}

forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, token: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, token, newPassword });
  }

logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('fullname');
}
updatePhone(email: string, phoneNumber: string): Observable<LoginResponseDto> {
    return this.http.post<any>(`${this.apiUrl}/update-phone`, { email, phoneNumber });
  }

getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get('https://localhost:7292/api/User/all', {
      headers: this.getAuthHeaders()
    });
  }
  get2FASetup(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/2fa/setup`, { params: { email } });
  }

  enable2FA(email: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/enable`, { email, token });
  }

  verifyTwoFactor(email: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/verify`, { email, token });
  }
  disable2FA(data: { email: string }) {
  return this.http.post('https://localhost:7292/api/Auth/disable-2fa', data);
}


}
