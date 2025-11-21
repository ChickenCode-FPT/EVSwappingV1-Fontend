import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  roles?: string[]; 
  lockout: boolean;
}
export interface PromoteUserRoleDto {
  newRole: string;
  replaceExistingRoles: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ManageUsersService {
  private apiUrl = 'https://localhost:7292/api/User'; 

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }
  

  lockUser(id: string) {
  return this.http.post(`${this.apiUrl}/lock/${id}`, {}, { headers: this.getAuthHeaders() });
}

unlockUser(id: string) {
  return this.http.post(`${this.apiUrl}/unlock/${id}`, {}, { headers: this.getAuthHeaders() });
}

promoteUserRole(userId: string, model: PromoteUserRoleDto): Observable<any> {
  return this.http.put(`${this.apiUrl}/${userId}/promote`, model);
}

}
