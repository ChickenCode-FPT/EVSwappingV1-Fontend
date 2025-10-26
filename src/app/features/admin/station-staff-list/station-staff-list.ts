import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { StationStaffService } from '../../../core/station-staff.service';
import { SidebarComponent } from "../../../shared/sidebar/sidebar";
@Component({
  selector: 'app-station-staff-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    DividerModule,
    TagModule,
    ToastModule,
    ProgressSpinnerModule,
    SidebarComponent,
    DialogModule,
    ConfirmDialogModule
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './station-staff-list.html',
  styleUrls: ['./station-staff-list.css']
})
export class StationStaffListComponent implements OnInit {
  stations: any[] = [];
  selectedStation: any | null = null;
  stationStaffs: any[] = [];
  loading = false;
  loadingStaffs = false;
  showDialog = false;

  constructor(
    private stationStaffService: StationStaffService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService

  ) {}

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.loading = true;
    this.stationStaffService.getAllStations().subscribe({
      next: (data) => {
        this.stations = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load stations'
        });
        this.loading = false;
      }
    });
  }

  viewStaffs(station: any) {
    this.selectedStation = station;
    this.loadingStaffs = true;
    this.showDialog = true;
    this.stationStaffService.getStationStaff(station.name).subscribe({
      next: (data) => {
        this.stationStaffs = data;
        this.loadingStaffs = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load staff list'
        });
        this.loadingStaffs = false;
      }
    });
  }

 closeDialog() {
    this.showDialog = false;
    this.selectedStation = null;
    this.stationStaffs = [];
  }

 confirmRemove(stationStaffId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this staff from the station?',
      header: 'Confirm Remove',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.removeStaff(stationStaffId);
      },
    });
  }

  removeStaff(staff: any) {
    this.stationStaffService.deactivateStaff(staff.stationStaffId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Removed',
          detail: `${staff.userName} has been deactivated.`,
        });
        this.stationStaffs = this.stationStaffs.filter(s => s.stationStaffId !== staff.stationStaffId);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to deactivate staff.',
        });
      }
    });
}
}
