import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StaffDto, StaffUpdateDto } from '../../models/staff.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
    private http = inject(HttpClient);
    private api = environment.apiBase;

    getStaffProfile(userId: string): Observable<StaffDto> {
        return this.http.get<StaffDto>(`${this.api}/User/${userId}`);
    }

    updateFaceId(staff: StaffUpdateDto): Observable<any> {
        return this.http.put(`${this.api}/User/profile`, staff);
    }

}