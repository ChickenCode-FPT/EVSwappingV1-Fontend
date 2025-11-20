import { Component, OnInit, signal } from '@angular/core';
import { InterStationTransferService } from '../services/inter-station-transfer.service';
import { BatteryService } from '../services/battery-service';
import { TransferDto } from '../../models/interTransfer.model';
import { MatDialog } from '@angular/material/dialog';
import { BatteryDetailDialog } from '../battery-detail-dialog/battery-detail-dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inter-transfer-list',
  imports: [DatePipe],
  templateUrl: './inter-transfer-list.html',
  styleUrl: './inter-transfer-list.css',
})
export class InterTransferList {
  view: 'incoming' | 'outgoing' = 'incoming';
  transfers: TransferDto[] = [];
  loading = false;
  isConfirming = false;
  currentTransfer: TransferDto | null = null;

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

  confirmTransfer(t: TransferDto) {

    if (t.status?.toLowerCase() === 'completed') {
      alert('Đơn này đã hoàn tất, không thể xác nhận.');
      return;
    }
    this.currentTransfer = t;
    this.isConfirming = true;
  }

  cancelConfirm() {
    this.isConfirming = false;
    this.currentTransfer = null;
  }

  async confirmComplete() {
    if (this.currentTransfer && this.currentTransfer.status?.toLowerCase() === 'approved') {
      try {
        await firstValueFrom(this.svc.completeTransfer(this.currentTransfer.transferId));
        alert('Hoàn tất thành công.');
        this.load();
      } catch (err) {
        console.error(err);
        alert('Có lỗi khi thực hiện hoàn tất.');
      } finally {
        this.isConfirming = false;
        this.currentTransfer = null;
      }
    } else {
      alert('Chỉ có đơn đã được Approve mới có thể hoàn tất.');
      this.isConfirming = false;
    }
  }
}
