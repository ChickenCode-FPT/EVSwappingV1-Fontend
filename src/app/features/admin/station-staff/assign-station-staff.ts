import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { StationStaffService, AssignStaffDto, StationDto } from '../../../core/station-staff.service';
import { ManageUsersService, UserDto } from '../../../core/manageusers.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-station-staff',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    FormsModule
  ],
  templateUrl: './assign-station-staff.html',
  styleUrls: ['./assign-station-staff.css']
})
export class AssignStationStaffComponent implements OnInit {
  assignForm: FormGroup;
  stations: StationDto[] = [];
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  selectedStation: StationDto | null = null;
  selectedUser: UserDto | null = null;
  loading = false;
  submitting = false;
  
  // Search and filter
  stationSearchTerm = '';
  userSearchTerm = '';
  showStationDropdown = false;
  showUserDropdown = false;

  staffRoles = [
    { label: 'Station Manager', value: 'Manager' },
    { label: 'Technician', value: 'Technician' },
    { label: 'Operator', value: 'Operator' },
    { label: 'Support Staff', value: 'Support' }
  ];

  // Toast
  toast = {
    visible: false,
    severity: 'success',
    summary: '',
    detail: ''
  };

  constructor(
    private fb: FormBuilder,
    private stationStaffService: StationStaffService,
    private userService: ManageUsersService,
    private router: Router
  ) {
    this.assignForm = this.fb.group({
      stationId: [null, Validators.required],
      userId: [null, Validators.required],
      role: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadStations();
    this.loadUsers();
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

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to load users');
      }
    });
  }

  get filteredStations() {
    if (!this.stationSearchTerm) return this.stations;
    const term = this.stationSearchTerm.toLowerCase();
    return this.stations.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.address.toLowerCase().includes(term)
    );
  }

  filterUsers() {
    if (!this.userSearchTerm) {
      this.filteredUsers = this.users;
      return;
    }
    const term = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  selectStation(station: StationDto) {
    this.selectedStation = station;
    this.assignForm.patchValue({ stationId: station.stationId });
    this.stationSearchTerm = station.name;
    this.showStationDropdown = false;
  }

  selectUser(user: UserDto) {
    this.selectedUser = user;
    this.assignForm.patchValue({ userId: user.id });
    this.userSearchTerm = user.fullName;
    this.showUserDropdown = false;
  }

  onSubmit() {
    if (this.assignForm.valid) {
      this.submitting = true;
      const dto: AssignStaffDto = {
        userId: this.assignForm.value.userId,
        role: this.assignForm.value.role
      };

      this.stationStaffService.assignStaff(this.assignForm.value.stationId, dto).subscribe({
        next: (response) => {
          this.showToast('success', 'Success', response.message || 'Staff assigned successfully');
          this.submitting = false;
          this.resetForm();
        },
        error: (err) => {
          this.showToast('error', 'Error', err.error?.message || 'Failed to assign staff');
          this.submitting = false;
        }
      });
    }
  }

  resetForm() {
    this.assignForm.reset();
    this.selectedStation = null;
    this.selectedUser = null;
    this.stationSearchTerm = '';
    this.userSearchTerm = '';
  }

  goBack() {
    this.router.navigate(['/admin/stations']);
  }

  getStatusSeverity(status: number): string {
    const severityMap: { [key: number]: string } = {
      0: 'bg-gray-100 text-gray-800',
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-red-100 text-red-800'
    };
    return severityMap[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: number): string {
    const labelMap: { [key: number]: string } = {
      0: 'Inactive',
      1: 'Active',
      2: 'Maintenance',
      3: 'Closed'
    };
    return labelMap[status] || 'Unknown';
  }

  showToast(severity: string, summary: string, detail: string) {
    this.toast = { visible: true, severity, summary, detail };
    setTimeout(() => {
      this.toast.visible = false;
    }, 3000);
  }
}