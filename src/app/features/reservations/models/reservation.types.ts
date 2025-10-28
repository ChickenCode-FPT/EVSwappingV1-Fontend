// src\app\features\reservations\models\reservation.types.ts
export interface CreateReservationRequest {
  stationId: number;
  vehicleId?: number | null;
  reservedFrom: string;
  reservedTo: string;
}

export interface ReservationDto {
  reservationId: number;
  userId: string;
  stationId: number;
  vehicleId?: number | null;

  reservedFrom: string; // ISO
  reservedTo: string;   // ISO
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Expired';
  paymentCheckoutUrl?: string; 
  paymentId?: number;
  reservedBatteryModelId?: number | null;

  allocation?: {
    reservationAllocationId: number;
    reservationId: number;
    batteryId: number;
    allocatedAt: string; // ISO
    holdUntil: string;   // ISO
    status: string;
  } | null;
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  [k: string]: any;
}
