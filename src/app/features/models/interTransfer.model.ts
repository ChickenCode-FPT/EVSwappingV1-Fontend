export interface TransferDto {
  transferId: number;
  fromStationId: number;
  fromStationName: string;
  toStationId: number;
  toStationName: string;
  batteryId: number;
  batterySerial: string;
  status: string;
  requestedAt: string;
  completedAt?: string | null;
  requestedBy: string;
  approvedBy?: string | null;
}

export interface TransferCreate {
  fromStationId: number;
  toStationId: number;
  batteryId: number;
  requestedByUserId: string;
}