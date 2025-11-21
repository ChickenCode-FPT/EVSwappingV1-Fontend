import { Injectable, inject } from '@angular/core'; // 👈 Import inject
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Battery } from '../../models/battery.model';
import { StationInventory, StationInventoryUpdateStatus } from '../../models/stationInventory.model';

@Injectable({
  providedIn: 'root',
})
export class StationInventoryService {
  private http = inject(HttpClient);

  private api = environment.apiBase;

  constructor() { }

  getStationInventories(): Observable<StationInventory[]> {
    return this.http.get<StationInventory[]>(`${this.api}/stationInventories`, { params: new HttpParams().set('pageSize', '1000') });
  }

  getStationInventoryById(stationInventoryId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/stationInventory/${stationInventoryId}`);
  }

  updateStatus(payload: StationInventoryUpdateStatus): Observable<any> {
    return this.http.put(`${this.api}/stationInventory`, payload);
  }

}
