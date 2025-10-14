// src\app\features\reservations\models\reservation.types.ts
// DTO gửi lên BE khi tạo reservation
export interface CreateReservationRequest {
  stationId: number;
  // optional: nếu user có nhiều xe thì truyền, nếu không gửi BE sẽ tự chọn chiếc đầu tiên
  vehicleId?: number | null;

  // thời gian đặt — ISO 8601 (khuyến nghị gửi UTC: new Date().toISOString())
  reservedFrom: string;
  reservedTo: string;
}

// DTO BE trả về sau khi tạo/lấy reservation
export interface ReservationDto {
  reservationId: number;
  userId: string;
  stationId: number;
  vehicleId?: number | null;

  reservedFrom: string; // ISO
  reservedTo: string;   // ISO
  status: 'Pending' | 'Completed' | 'Expired' | 'Cancelled';

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
