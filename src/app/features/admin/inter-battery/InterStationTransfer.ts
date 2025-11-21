
// inter-station-transfer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { InterStationTransferService } from '../../../core/interBatteryStation.service';

export interface InterStationTransferAdminDto {
  transferId: number;
  fromStationId: number;
  fromStationName: string | null;
  toStationId: number;
  toStationName: string | null;
  batteryId: number;
  batterySerial: string | null;
  requestedByUserId: string | null;
  requestedBy: string | null;
  approvedByUserId: string | null;
  approvedBy: string | null;
  status: string;
  requestedAt: string;
  completedAt: string | null;
  canApprove: boolean;
}

export interface ApproveTransferDto {
  approvedByUserId: string;
}

@Component({
  selector: 'app-inter-station-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './inter-station-transfer.html',
  styleUrls: ['./inter-station-transfer.css']
})
export class InterStationTransferComponent implements OnInit {
  transfers: InterStationTransferAdminDto[] = [];
  filteredTransfers: InterStationTransferAdminDto[] = [];
  loading = false;
  approveDialogVisible = false;
  selectedTransfer: InterStationTransferAdminDto | null = null;
  approveForm: FormGroup;
  submitting = false;
  searchText = '';
  Math = Math;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  toast = {
    show: false,
    severity: 'info',
    summary: '',
    detail: ''
  };

  get pendingCount(): number {
    return this.transfers.filter(t => t.status === 'Pending').length;
  }

  get approvedCount(): number {
    return this.transfers.filter(t => t.status === 'Approved').length;
  }

  get paginatedTransfers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTransfers.slice(start, end);
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private transferService: InterStationTransferService
  ) {
    this.approveForm = this.fb.group({
      approvedByUserId: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.loadTransfers();
  }

  loadTransfers() {
    this.loading = true;
    
    this.transferService.getAllTransfers().subscribe({
      next: (data) => {
        this.transfers = data;
        this.filteredTransfers = data;
        this.totalPages = Math.ceil(this.filteredTransfers.length / this.itemsPerPage);
        this.loading = false;
      },
      error: (err) => {
        this.showToast('error', 'Error', 'Cannot load transfer list');
        this.loading = false;
      }
    });
  }

  filterTransfers() {
    if (!this.searchText.trim()) {
      this.filteredTransfers = this.transfers;
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredTransfers = this.transfers.filter(t =>
        t.batterySerial?.toLowerCase().includes(search) ||
        t.requestedBy?.toLowerCase().includes(search) ||
        t.fromStationName?.toLowerCase().includes(search) ||
        t.toStationName?.toLowerCase().includes(search) ||
        t.status.toLowerCase().includes(search)
      );
    }
    this.totalPages = Math.ceil(this.filteredTransfers.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  showApproveDialog(transfer: InterStationTransferAdminDto) {
    if (!transfer.canApprove) {
      this.showToast('warn', 'Warning', 'Only pending requests can be approved');
      return;
    }
    
    this.selectedTransfer = transfer;
    this.approveDialogVisible = true;
    this.approveForm.reset();
  }

  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload?.sub || payload?.nameid || null;
      return userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  approveTransfer() {
    const currentUserId = this.getUserIdFromToken();
    if (!currentUserId) {
      this.showToast('error', 'Authentication Error', 'User information not found. Please login again.');
      return;
    }
    
    if (this.selectedTransfer) {
      this.submitting = true;
      const dto: ApproveTransferDto = {
        approvedByUserId: currentUserId
      };
      
      this.transferService.approveTransfer(this.selectedTransfer.transferId, dto).subscribe({
        next: (response) => {
          this.showToast('success', 'Success', response || 'Transfer request approved');
          this.submitting = false;
          this.approveDialogVisible = false;
          this.loadTransfers();
        },
        error: (err) => {
          this.showToast('error', 'Error', err.error || 'Cannot approve request');
          this.submitting = false;
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      'Pending': 'Pending',
      'Approved': 'Approved',
      'Rejected': 'Rejected',
      'Completed': 'Completed'
    };
    return labelMap[status] || status;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refresh() {
    this.loadTransfers();
  }

  viewDetails(transfer: InterStationTransferAdminDto) {
    console.log('View details:', transfer);
    this.showToast('info', 'Info', 'Feature under development');
  }

  exportData() {
    this.showToast('info', 'Export Data', 'Feature under development');
  }

  showToast(severity: string, summary: string, detail: string) {
    this.toast = { show: true, severity, summary, detail };
    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }
}