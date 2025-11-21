import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TransferDto, TransferCreate } from '../../models/interTransfer.model';

@Injectable({ providedIn: 'root' })
export class InterStationTransferService {
  private http = inject(HttpClient);
  private api = environment.apiBase;

  getIncoming(): Observable<TransferDto[]> {
    return this.http.get<TransferDto[]>(`${this.api}/InterStationTransfers/incoming`);
  }

  getOutgoing(): Observable<TransferDto[]> {
    return this.http.get<TransferDto[]>(`${this.api}/InterStationTransfers/outgoing`);
  }

  createTransfer(payload: TransferCreate): Observable<any> {
    return this.http.post(`${this.api}/InterStationTransfers/create`, payload);
  }

  completeTransfer(transferId: number): Observable<any> {
    return this.http.post(`${this.api}/InterStationTransfers/${transferId}/complete`, {});
  }
}