// src/app/features/staff/battery-transaction-detail/battery-transaction-detail.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { SwapTransactionService } from '../services/swapTransaction-service';
import { BatteryService } from '../services/battery-service';
import { StaffService } from '../services/staff.service';
import { TransactionFull } from '../../models/transaction.model';
import { BatteryDto } from '../../station/models/battery.types';
import { Battery } from '../../models/battery.model';

@Component({
  selector: 'app-battery-transaction-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './battery-transaction-detail.html',
  styleUrls: ['./battery-transaction-detail.css']
})
export class BatteryTransactionDetail implements OnInit {
  transaction!: TransactionFull;
  outgoingBattery: any;
  incomingBattery: any;

  availableOutgoingBatteries: BatteryDto[] = [];
  availableIncomingBatteries: Battery[] = [];

  loading = true;
  mode: 'view' | 'confirm' = 'view';

  showOutgoingPopup = false;
  showCompleteSwapPopup = false;
  showMissingFacePopup = false;

  outgoingBatteryId: number | null = null;
  incomingBatteryId: number | null = null;

  pendingReturnUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private swapService: SwapTransactionService,
    private batteryService: BatteryService,
    private staffService: StaffService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const verifiedParam = params['verified'] === 'true';
      const alreadyVerified = localStorage.getItem('staff_fid_verified') === 'true';

      if (verifiedParam || alreadyVerified) {
        localStorage.setItem('staff_fid_verified', 'true');

        const openFlag = params['open'];
        if (openFlag === 'outgoing') {
          this.showOutgoingPopup = true;
        }
        if (openFlag === 'incoming') {
          this.showCompleteSwapPopup = true;
        }
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadTransaction(+id);
    });

    this.mode = this.route.snapshot.data['mode'] || 'view';
  }

  async loadTransaction(id: number) {
    this.loading = true;

    try {
      const res = await firstValueFrom(
        this.swapService.getFullTransactionById(id)
      );
      this.transaction = res;

      await this.loadBatteries(res);
      await this.loadBatteryListsForTransaction(res);
    } finally {
      this.loading = false;
    }
  }

  private async loadBatteries(res: TransactionFull) {
    const tasks: Promise<any>[] = [];

    if (res.outgoingBatteryId) {
      tasks.push(
        firstValueFrom(this.batteryService.getBatteryById(res.outgoingBatteryId))
          .then(b => this.outgoingBattery = b)
      );
    }

    if (res.incomingBatteryId) {
      tasks.push(
        firstValueFrom(this.batteryService.getBatteryById(res.incomingBatteryId))
          .then(b => this.incomingBattery = b)
      );
    }

    await Promise.all(tasks);
  }

  private async loadBatteryListsForTransaction(res: TransactionFull) {
    const stationId = res.stationId;
    const batteryModelId: number | null = null;

    const tasks: Promise<any>[] = [];

    if (stationId) {
      tasks.push(
        firstValueFrom(
          this.batteryService.getAvailableOutgoingBatteries(stationId, batteryModelId)
        ).then(list => {
          this.availableOutgoingBatteries = list ?? [];
        })
      );
    }

    tasks.push(
      firstValueFrom(this.batteryService.getBatteries())
        .then(list => {
          this.availableIncomingBatteries = list ?? [];
        })
    );

    await Promise.all(tasks);
  }

  canShowConfirmButton() {
    return this.mode === 'confirm' && this.transaction.swapStatus === 'Pending';
  }

  async confirmSwap(): Promise<void> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const staff: any = await firstValueFrom(this.staffService.getStaffProfile(userId));

    if (!staff?.fId) {
      this.pendingReturnUrl =
        `/staff/battery/transaction/${this.transaction.swapTransactionId}`;
      this.showMissingFacePopup = true;
      return;
    }

    localStorage.setItem('staff_fid', staff.fId);

    const verified = localStorage.getItem('staff_fid_verified') === 'true';
    if (!verified) {
      this.router.navigate(['/staff/face/verify'], {
        queryParams: {
          next: `/staff/battery/transaction/${this.transaction.swapTransactionId}`,
          open: 'outgoing'
        }
      });
      return;
    }

    this.showOutgoingPopup = true;
  }

  async submitOutgoingBattery() {
    if (!this.outgoingBatteryId) {
      alert('Vui lòng chọn OUTGOING battery');
      return;
    }

    const payload = {
      swapTransactionId: this.transaction.swapTransactionId,
      staffUserId: localStorage.getItem('userId'),
      outgoingBatteryId: this.outgoingBatteryId
    };

    await firstValueFrom(this.swapService.confirmSwapByStaff(payload));

    this.showOutgoingPopup = false;

    await this.loadTransaction(this.transaction.swapTransactionId);
  }

  canShowCompleteSwapButton() {
    return this.mode === 'confirm' && this.transaction.swapStatus === 'InProgress';
  }

  async openCompleteSwapPopup() {
    const verified = localStorage.getItem('staff_fid_verified') === 'true';
    const fId = localStorage.getItem('staff_fid');

    if (!verified && fId) {
      this.router.navigate(['/staff/face/verify'], {
        queryParams: {
          next: `/staff/battery/transaction/${this.transaction.swapTransactionId}`,
          open: 'incoming'
        }
      });
      return;
    }

    this.showCompleteSwapPopup = true;
  }

  closeCompleteSwapPopup() {
    this.showCompleteSwapPopup = false;
  }

  async completeSwap() {
    if (!this.incomingBatteryId) {
      alert('Vui lòng chọn INCOMING battery');
      return;
    }

    const payload = {
      swapTransactionId: this.transaction.swapTransactionId,
      incomingBatteryId: this.incomingBatteryId
    };

    await firstValueFrom(this.swapService.completeSwap(payload));

    this.showCompleteSwapPopup = false;

    localStorage.removeItem('staff_fid_verified');

    await this.loadTransaction(this.transaction.swapTransactionId);
  }

  goToAddFace() {
    this.showMissingFacePopup = false;

    this.router.navigate(['/staff/face/add'], {
      queryParams: {
        returnTo: this.pendingReturnUrl
      }
    });
  }
}
