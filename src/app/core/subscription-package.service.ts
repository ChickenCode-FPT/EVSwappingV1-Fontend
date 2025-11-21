import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PackageDto {
    packageId: number;
    name: string;
    billingCycle: string;
    price: number;
    includedSwaps: number;
    status: string;
    createdAt: Date;
}

export interface CreatePackageDto {
    name: string;
    billingCycle: string;
    price: number;
    includedSwaps: number;
}

export interface UpdatePackageDto {
    name: string;
    price: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPackageService {
  private apiUrl = 'https://localhost:7292/api/SubscriptionPackage'; 

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
    getAllPackages(): Observable<PackageDto[]> {
    return this.http.get<PackageDto[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }
    createPackage(model: CreatePackageDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, model, {
      headers: this.getAuthHeaders()
    });
  }
    updatePackage(packageId: number, model: UpdatePackageDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${packageId}`, model, {
      headers: this.getAuthHeaders()
    });
  }
    inactivePackage(packageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/inactive/${packageId}`, {
      headers: this.getAuthHeaders()
    });
  }
    reactivePackage(packageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivate/${packageId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

    publishPackage(packageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/publish/${packageId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }



}
