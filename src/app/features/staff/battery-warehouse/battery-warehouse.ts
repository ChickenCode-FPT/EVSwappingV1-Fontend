import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BatteryService } from '../services/battery-service';
import { Battery } from '../../models/battery.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BatteryDetailDialog } from '../battery-detail-dialog/battery-detail-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { firstValueFrom } from 'rxjs';

// Giao diện hiển thị trạng thái pin
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
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './battery-warehouse.html',
  styleUrls: ['./battery-warehouse.css']
})
export class BatteryWarehouse implements OnInit {
  private batteryService = inject(BatteryService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // --- SIGNALS ---
  batteries = signal<Battery[]>([]);
  selectedStatus = signal<string>('');
  selectedModel = signal<string>('');
  minSoH = signal<number | null>(null);
  maxSoH = signal<number | null>(null);
  loading = signal<boolean>(false);

  async ngOnInit() {
    await this.loadBatteries();
  }

  async loadBatteries() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.batteryService.getBatteries());
      this.batteries.set(data);
    } catch (err) {
      console.error('❌ Lỗi load pin:', err);
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

  // Hiển thị biểu tượng + màu theo trạng thái
  getStatusAppearance(status: string): StatusAppearance {
    switch (status.toUpperCase()) {
      case 'GOOD':
        return { color: 'primary', icon: 'check_circle' };
      case 'AVAILABLE':
        return { color: 'primary', icon: 'battery_full' };
      case 'CHARGING':
        return { color: 'accent', icon: 'bolt' };
      case 'INUSE':
        return { color: 'accent', icon: 'local_shipping' };
      case 'MAINTENANCE':
        return { color: 'accent', icon: 'build' };
      case 'FAULTY':
        return { color: 'warn', icon: 'report_problem' };
      default:
        return { color: undefined, icon: 'help_outline' };
    }
  }

  openBatteryDetailDialog(batteryId: number) {
    const battery = this.batteries().find(b => b.batteryId === batteryId);
    if (battery) {
      this.dialog.open(BatteryDetailDialog, {
        data: battery,
        width: '1200px',
        maxWidth: '1500px',
        maxHeight: '90vh',
        panelClass: 'modern-dialog-panel'
      });
    }
  }

  // --- COMPUTED SIGNALS ---

  // Trạng thái pin (unique)
  statuses = computed(() =>
    Array.from(new Set(this.batteries().map(b => b.status))).filter(s => s !== '')
  );

  // Model pin (unique theo modelCode)
  models = computed(() =>
    Array.from(
      new Set(
        this.batteries()
          .filter(b => !!b.batteryModel)
          .map(b => b.batteryModel.modelCode)
      )
    )
  );

  // Bộ lọc hiển thị
  filteredBatteries = computed(() => {
    return this.batteries().filter(b => {
      const statusOk = this.selectedStatus() ? b.status === this.selectedStatus() : true;
      const modelOk = this.selectedModel()
        ? b.batteryModel?.modelCode === this.selectedModel()
        : true;

      const sohMinOk = this.minSoH() !== null ? b.currentSoH >= this.minSoH()! : true;
      const sohMaxOk = this.maxSoH() !== null ? b.currentSoH <= this.maxSoH()! : true;

      return statusOk && modelOk && sohMinOk && sohMaxOk;
    });
  });

  batteryCountByStatus = computed(() => {
    const counts: Record<string, number> = {};
    this.batteries().forEach(b => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  });

  navigateToAddBattery() {
    this.router.navigate(['staff/battery/add']);
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
