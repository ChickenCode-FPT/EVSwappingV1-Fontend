import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InterStationTransferAdminDto {
  transferId: number;
  fromStationId: number;
  fromStationName: string | null;
  toStationId: number;
  toStationName: string | null;
  batteryId: number;
  batterySerial: string | null;
  requestedByUserId: string | null;
  requestedBy: string | null;
  approvedByUserId: string | null;
  approvedBy: string | null;
  status: string; // "Pending", "Approved", "Rejected", "Completed"
  requestedAt: string;
  completedAt: string | null;
  canApprove: boolean;
}

export interface ApproveTransferDto {
  approvedByUserId: string;
}

export interface ApiResponse {
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class InterStationTransferService {
  private apiUrl = `https://localhost:7292/api/InterStationTransfers`; // Adjust base URL as needed

  constructor(private http: HttpClient) {}

  /**
   * Get all inter-station transfers
   * GET /api/inter-station-transfer
   * 
   * @returns Observable<InterStationTransferAdminDto[]>
   * @produces List of InterStationTransferAdminDto
   */
  getAllTransfers(): Observable<InterStationTransferAdminDto[]> {
    return this.http.get<InterStationTransferAdminDto[]>(this.apiUrl);
  }

  /**
   * Approve a transfer request
   * POST /api/inter-station-transfer/{transferId}/approve
   * 
   * @param transferId - The transfer ID to approve
   * @param dto - ApproveTransferDto containing approvedByUserId
   * @returns Observable<string> - Success message
   */
  approveTransfer(transferId: number, dto: ApproveTransferDto): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/${transferId}/approve`,
      dto,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  /**
   * Get transfer by ID
   * (Optional - implement if you have this endpoint)
   */
  getTransferById(transferId: number): Observable<InterStationTransferAdminDto> {
    return this.http.get<InterStationTransferAdminDto>(`${this.apiUrl}/${transferId}`);
  }

  /**
   * Get transfers by status
   * (Optional - implement if you have this endpoint)
   * @param status - "Pending", "Approved", "Rejected", "Completed"
   */
  getTransfersByStatus(status: string): Observable<InterStationTransferAdminDto[]> {
    return this.http.get<InterStationTransferAdminDto[]>(
      `${this.apiUrl}/status/${status}`
    );
  }

  /**
   * Get transfers by station
   * (Optional - implement if you have this endpoint)
   * @param stationId - The station ID
   */
  getTransfersByStation(stationId: number): Observable<InterStationTransferAdminDto[]> {
    return this.http.get<InterStationTransferAdminDto[]>(
      `${this.apiUrl}/station/${stationId}`
    );
  }

  /**
   * Get transfers by battery
   * (Optional - implement if you have this endpoint)
   * @param batteryId - The battery ID
   */
  getTransfersByBattery(batteryId: number): Observable<InterStationTransferAdminDto[]> {
    return this.http.get<InterStationTransferAdminDto[]>(
      `${this.apiUrl}/battery/${batteryId}`
    );
  }

  /**
   * Get pending transfers only
   * Filters transfers with status "Pending"
   */
  getPendingTransfers(): Observable<InterStationTransferAdminDto[]> {
    return this.getTransfersByStatus('Pending');
  }

  /**
   * Reject a transfer request
   * (Optional - implement if you have this endpoint)
   * POST /api/inter-station-transfer/{transferId}/reject
   */
  rejectTransfer(transferId: number, rejectedByUserId: string, reason?: string): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/${transferId}/reject`,
      { rejectedByUserId, reason },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  /**
   * Complete a transfer
   * (Optional - implement if you have this endpoint)
   * POST /api/inter-station-transfer/{transferId}/complete
   */
  completeTransfer(transferId: number): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/${transferId}/complete`,
      {},
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  /**
   * Export transfers data
   * (Optional - implement if you have this endpoint)
   * GET /api/inter-station-transfer/export
   */
  exportTransfers(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export?format=${format}`,
      { responseType: 'blob' }
    );
  }
}