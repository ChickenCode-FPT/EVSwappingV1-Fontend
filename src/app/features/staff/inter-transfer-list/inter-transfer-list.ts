import { Component, OnInit, signal } from '@angular/core';
import { InterStationTransferService } from '../services/inter-station-transfer.service';
import { BatteryService } from '../services/battery-service';
import { TransferDto } from '../../models/interTransfer.model';
import { MatDialog } from '@angular/material/dialog';
import { BatteryDetailDialog } from '../battery-detail-dialog/battery-detail-dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inter-transfer-list',
  imports: [DatePipe, FormsModule],
  templateUrl: './inter-transfer-list.html',
  styleUrl: './inter-transfer-list.css',
})
export class InterTransferList {
  view: 'incoming' | 'outgoing' = 'incoming';
  transfers: TransferDto[] = [];
  loading = false;
  isConfirming = false;
  currentTransfer: TransferDto | null = null;
  availableSlots: string[] = [];
  selectedSlot: string = '';


  constructor(
    private svc: InterStationTransferService,
    private battery: BatteryService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loading = true;
    try {
      if (this.view === 'incoming') {
        this.transfers = await firstValueFrom(this.svc.getIncoming());
      } else {
        this.transfers = await firstValueFrom(this.svc.getOutgoing());
      }
    } catch (err) {
      console.error('Lỗi load transfers', err);
    } finally {
      this.loading = false;
    }
  }

  switchView(view: 'incoming' | 'outgoing') {
    this.view = view;
    this.load();
  }

  openCreate() {
    this.router.navigate(['/staff/inter/transfers/create']);
  }

  openDetail(battery: { batteryId: number }) {
    this.battery.getBatteryById(battery.batteryId).subscribe(fullBattery => {
      this.dialog.open(BatteryDetailDialog, {
        data: fullBattery,
        width: '900px'
      });
    });
  }

  async confirmTransfer(t: TransferDto) {
    if (t.status?.toLowerCase() === 'completed') {
      alert('Đơn này đã hoàn tất.');
      return;
    }

    this.currentTransfer = t;
    try {
      this.availableSlots = await firstValueFrom(
        this.svc.getAvailableSlots(t.toStationId)
      );
    } catch (err) {
      console.error(err);
      alert("Không tải được danh sách slot.");
      return;
    }

    this.isConfirming = true;
  }


  cancelConfirm() {
    this.isConfirming = false;
    this.currentTransfer = null;
  }

  async confirmComplete() {
    if (!this.selectedSlot) {
      alert("Vui lòng chọn một slot.");
      return;
    }

    if (this.currentTransfer && this.currentTransfer.status?.toLowerCase() === 'approved') {
      try {
        const res = await firstValueFrom(
          this.svc.completeTransfer(this.currentTransfer.transferId, this.selectedSlot)
        );

        alert("Completed successfully");
        this.load();
      } catch (err: any) {
        console.error(err);

        if (err?.error?.message) {
          alert(err.error.message);
        } else {
          alert('There was an error while completing.');
        }
      } finally {
        this.isConfirming = false;
        this.currentTransfer = null;
        this.selectedSlot = '';
      }
    }
  }
}
