import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Station } from '../../models/station.model';


@Injectable({ providedIn: 'root' })
export class StationService {
  private http = inject(HttpClient);
  private api = environment.apiBase;

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.api}/Station`);
  }
}