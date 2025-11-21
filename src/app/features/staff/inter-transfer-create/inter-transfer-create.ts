import { Component, OnInit } from '@angular/core';
import { InterStationTransferService } from '../services/inter-station-transfer.service';
import { StationInventoryService } from '../services/station-inventory-services';
import { StationService } from '../services/station.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Station } from '../../models/station.model';
import { StationInventory } from '../../models/stationInventory.model';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-inter-transfer-create',
  imports: [ReactiveFormsModule],
  templateUrl: './inter-transfer-create.html',
  styleUrl: './inter-transfer-create.css',
})
export class InterTransferCreate implements OnInit{
form: FormGroup;
  stations: Station[] = [];
  batteries: StationInventory[] = [];
  loading = false;
  creating = false;
  staffStationId?: number;
  currentUserId?: string;

  constructor(
    private svc: InterStationTransferService,
    private station: StationService,
    private stationInventory: StationInventoryService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      batteryId: [null, Validators.required],
      toStationId: [null, Validators.required],
    });
  }

  async ngOnInit() {
    this.staffStationId = Number(localStorage.getItem('stationId'));
    this.currentUserId = localStorage.getItem('userId') || undefined;

    this.loading = true;
    try {
      const [stations, inventories] = await Promise.all([
        firstValueFrom(this.station.getStations()),
        firstValueFrom(this.stationInventory.getStationInventories()),
      ]);

      // exclude the staff's own station from destination list
      this.stations = stations.filter(s => s.stationId !== this.staffStationId);

      // only batteries at staff's station
      this.batteries = inventories.filter(inv => inv.stationId === this.staffStationId);
    } catch (err) {
      console.error('Loading data failed', err);
      alert('Có lỗi khi load danh sách.');
    } finally {
      this.loading = false;
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.staffStationId || !this.currentUserId) {
      alert('Không tìm thấy stationId hoặc userId. Kiểm tra localStorage.');
      return;
    }

    const payload = {
      fromStationId: this.staffStationId,
      toStationId: Number(this.form.value.toStationId),
      batteryId: Number(this.form.value.batteryId),
      requestedByUserId: this.currentUserId,
    };

    this.creating = true;
    try {
      await firstValueFrom(this.svc.createTransfer(payload));
      alert('Tạo đơn thành công.');
      this.router.navigate(['/staff/transfers']);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo đơn.');
    } finally {
      this.creating = false;
    }
  }
}
