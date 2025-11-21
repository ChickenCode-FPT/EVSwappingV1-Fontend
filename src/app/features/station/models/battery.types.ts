export interface BatteryDto {
  batteryId: number;
  serialNumber: string;
  status: string;                
  currentSoH?: number | null;   
  cycleCount?: number | null;    
  batteryModelId: number;        
}
