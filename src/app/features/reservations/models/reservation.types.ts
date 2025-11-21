import { StationDto } from "../../../core/station-staff.service";
import { BatteryModelDto } from "../../models/battery.model";

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

  station?: StationDto;  
  batteryModel?: BatteryModelDto | null;

  vehicleId?: number | null;
  reservedFrom: string;
  reservedTo: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Expired';

  paymentCheckoutUrl?: string;
  paymentId?: number;
  reservedBatteryModelId?: number | null;

  allocation?: {
    reservationAllocationId: number;
    reservationId: number;
    batteryId: number;
    allocatedAt: string;
    holdUntil: string;
    status: string;
    battery?: {
      serialNumber: string;
      batteryModelId: number;
      modelName?: string;
      capacity?: number;
    };
  } | null;

  createdAt: string;
  updatedAt?: string | null;
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  [k: string]: any;
}
