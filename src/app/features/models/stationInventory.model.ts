import { Battery } from './battery.model';

export interface StationInventory {
  stationInventoryId: number;
  stationId: number;
  batteryId: number;
  slotNumber: string;
  status: string;
  checkedAt: string;
  batteries: Battery;
}

export interface StationInventoryUpdateStatus {
  stationInventoryId: number;
  status: string;
}