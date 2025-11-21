import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BatteryService } from '../services/battery-service';
import { StationInventoryService } from '../services/station-inventory-services';
import { Battery } from '../../models/battery.model';
import { BatteryDetailDialog } from '../battery-detail-dialog/battery-detail-dialog';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { StationInventory } from '../../models/stationInventory.model';

// Combined view type used in template (inventory + battery flattened)
type InventoryView = StationInventory & { batteries: Battery; inventoryStatus: string };

interface StatusAppearance {
  color: 'primary' | 'accent' | 'warn' | undefined;
  icon: string;
}

@Component({
  selector: 'app-battery-warehouse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './battery-warehouse.html',
  styleUrls: ['./battery-warehouse.css']
})
export class BatteryWarehouse implements OnInit {
  private batteryService = inject(BatteryService);
  private stationInventoryService = inject(StationInventoryService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // --- SIGNALS ---
  inventories = signal<StationInventory[]>([]); // keep raw inventories
  selectedStatus = signal<string>('');
  selectedModel = signal<string>('');
  minSoH = signal<number | null>(null);
  maxSoH = signal<number | null>(null);
  loading = signal<boolean>(false);

  // edit popup signals
  showEditPopup = signal<boolean>(false);
  editInventory = signal<StationInventory | null>(null);
  newStatus = signal<string>('');

  showConfirmUpdatePopup = signal<boolean>(false);

  async ngOnInit() {
    await this.loadInventories();
  }

  // load StationInventory[] from API (stationId filtered)
  async loadInventories() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.stationInventoryService.getStationInventories());
      const stationId = localStorage.getItem('stationId');

      if (stationId) {
        const filteredInventories = data.filter(inv => inv.stationId.toString() === stationId);
        this.inventories.set(filteredInventories);
      } else {
        console.warn('⚠️ StationId not found in localStorage');
      }
    } catch (err) {
      console.error('❌ Lỗi load inventories:', err);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.selectedStatus.set('');
    this.selectedModel.set('');
    this.minSoH.set(null);
    this.maxSoH.set(null);
  }

  getStatusAppearance(status: string): StatusAppearance {
    switch ((status || '').toUpperCase()) {
      case 'GOOD': return { color: 'primary', icon: 'check_circle' };
      case 'AVAILABLE': return { color: 'primary', icon: 'battery_full' };
      case 'CHARGING': return { color: 'accent', icon: 'bolt' };
      case 'INUSE': return { color: 'accent', icon: 'local_shipping' };
      case 'MAINTENANCE': return { color: 'accent', icon: 'build' };
      case 'FAULTY': return { color: 'warn', icon: 'report_problem' };
      default: return { color: undefined, icon: 'help_outline' };
    }
  }

  openBatteryDetailDialog(batteryId: number) {
    // find by batteryId inside inventories
    const inv = this.inventories().find(i => i.batteries?.batteryId === batteryId);
    if (inv && inv.batteries) {
      this.dialog.open(BatteryDetailDialog, {
        data: inv.batteries,
        width: '1200px',
        maxWidth: '1500px',
        maxHeight: '90vh',
        panelClass: 'modern-dialog-panel'
      });
    }
  }

  // --- COMPUTED VIEWS ---

  // unique statuses come from inventory.status (we want to edit inventory.status)
  statuses = computed(() =>
    Array.from(new Set(this.inventories().map(i => i.status))).filter(s => s !== '')
  );

  models = computed(() =>
    Array.from(new Set(
      this.inventories()
        .map(i => i.batteries)
        .filter(b => !!b && !!b.batteryModel)
        .map(b => b.batteryModel.modelCode)
    ))
  );

  // flattened items for display: include battery props and inventoryStatus
  filteredBatteries = computed(() => {
    const items: InventoryView[] = this.inventories().map(inv => ({
      ...inv,
      inventoryStatus: inv.status,
      batteries: inv.batteries
    })) as InventoryView[];

    return items.filter(b => {
      const statusOk = this.selectedStatus() ? b.inventoryStatus === this.selectedStatus() : true;
      const modelOk = this.selectedModel()
        ? b.batteries?.batteryModel?.modelCode === this.selectedModel()
        : true;

      const soh = b.batteries?.currentSoH ?? 0;
      const sohMinOk = this.minSoH() !== null ? soh >= this.minSoH()! : true;
      const sohMaxOk = this.maxSoH() !== null ? soh <= this.maxSoH()! : true;

      return statusOk && modelOk && sohMinOk && sohMaxOk;
    });
  });

  batteryCountByStatus = computed(() => {
    const counts: Record<string, number> = {};
    this.inventories().forEach(inv => {
      const s = inv.status || 'UNKNOWN';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  });

  navigateToAddBattery() {
    this.router.navigate(['staff/battery/add']);
  }

  // open edit popup — receive InventoryView or StationInventory
  openEditPopup(item: InventoryView | null) {
    if (!item) return;
    const blockedStatuses = ['ORDERED', 'DELIVERED'];

    if (blockedStatuses.includes((item.inventoryStatus || item.status || '').toUpperCase())) {
      alert(`Status "${item.inventoryStatus || item.status}" cannot be edited.`);
      return;
    }

    // set editInventory as the actual StationInventory (find by id to keep original reference)
    const inv = this.inventories().find(x => x.stationInventoryId === item.stationInventoryId) ?? null;

    if (!inv) {
      console.warn("Inventory not found:", item.stationInventoryId);
      return;
    }

    this.editInventory.set(inv);
    this.newStatus.set(inv.status);
    this.showEditPopup.set(true);
  }

  openConfirmUpdatePopup() {
    this.showEditPopup.set(false);
    this.showConfirmUpdatePopup.set(true);
  }

  /*
  async updateInventoryStatus() {
    const inventory = this.editInventory();
    if (!inventory) return;

    const payload = {
      stationInventoryId: inventory.stationInventoryId,
      status: this.newStatus()
    };

    try {
      this.loading.set(true);
      await firstValueFrom(this.stationInventoryService.updateStatus(payload));

      // update inventories signal in place
      this.inventories.update(list =>
        list.map(i =>
          i.stationInventoryId === inventory.stationInventoryId
            ? { ...i, status: payload.status }
            : i
        )
      );

      this.showConfirmUpdatePopup.set(false);
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Update failed!');
    } finally {
      this.loading.set(false);
    }
  }
    */

  async updateBatteryStatus() {
    const inventory = this.editInventory();
    if (!inventory || !inventory.batteries) {
      alert('Battery not found!');
      return;
    }

    const payload = {
      batteryId: inventory.batteries.batteryId,
      status: this.newStatus()
    };

    try {
      this.loading.set(true);
      await firstValueFrom(this.batteryService.updateStatus(payload));

      this.inventories.update(list =>
        list.map(i =>
          i.stationInventoryId === inventory.stationInventoryId
            ? {
              ...i,
              batteries: {
                ...i.batteries!,
                status: payload.status
              }
            }
            : i
        )
      );

      this.showConfirmUpdatePopup.set(false);
      alert('Battery status updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Update failed!');
    } finally {
      this.loading.set(false);
    }
  }

  // helper to display battery-specific fields in template safely
  getBatterySafe(b: InventoryView) {
    return b.batteries ?? ({} as Battery);
  }

  displayedColumnsWithActions: string[] = [
    'batteryId',
    'serialNumber',
    'batteryModel',
    'currentSoH',
    'cycleCount',
    'status',
    'lastMaintenance',
    'actions'
  ];
}
