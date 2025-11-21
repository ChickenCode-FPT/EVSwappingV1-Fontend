import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationStaffService } from '../../../core/station-staff.service';
import { SidebarComponent } from "../../../shared/sidebar/sidebar";

@Component({
  selector: 'app-station-staff-list',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
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

  toast = {
    show: false,
    severity: 'info',
    summary: '',
    detail: ''
  };

  confirmDialog = {
    show: false,
    message: '',
    header: '',
    acceptLabel: 'Yes',
    rejectLabel: 'No',
    accept: () => {},
    reject: () => {}
  };

  constructor(private stationStaffService: StationStaffService) {}

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
        this.showToast('error', 'Error', 'Failed to load stations');
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
        this.showToast('error', 'Error', 'Failed to load staff list');
        this.loadingStaffs = false;
      }
    });
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedStation = null;
    this.stationStaffs = [];
  }

  confirmRemove(staff: any) {
    this.confirmDialog = {
      show: true,
      message: 'Are you sure you want to remove this staff from the station?',
      header: 'Confirm Remove',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.removeStaff(staff);
        this.confirmDialog.show = false;
      },
      reject: () => {
        this.confirmDialog.show = false;
      }
    };
  }

  removeStaff(staff: any) {
    this.stationStaffService.deactivateStaff(staff.stationStaffId).subscribe({
      next: () => {
        this.showToast('success', 'Removed', `${staff.userName} has been deactivated.`);
        this.stationStaffs = this.stationStaffs.filter(s => s.stationStaffId !== staff.stationStaffId);
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to deactivate staff.');
      }
    });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.toast = { show: true, severity, summary, detail };
    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }
}