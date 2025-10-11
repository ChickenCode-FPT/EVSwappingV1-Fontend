export interface CreateReservationRequest {
  userId: string;
  stationId: number;
  batteryModelId?: number | null;   // optional
  scheduledAt?: string | null;      // ISO string, optional
  notes?: string | null;
}

export interface ReservationDto {
  reservationId: number;
  userId: string;
  stationId: number;
  stationName?: string;
  batteryModelId?: number | null;
  status: 'Pending' | 'Completed' | 'Expired' | 'Cancelled';
  // thời điểm tạo / lịch hẹn
  createdAt: string;   // ISO
  scheduledAt?: string | null; // ISO
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  [k: string]: any;
}
