import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { InterStationTransferService} from '../../../core/interBatteryStation.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';

// DTOs and Service
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
  status: string; // "Pending", "Approved", "Rejected", "Completed"
  requestedAt: string;
  completedAt: string | null;
  canApprove: boolean;
}

export interface ApproveTransferDto {
  approvedByUserId: string;
}

type TagSeverity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | null | undefined;

@Component({
  selector: 'app-inter-station-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ProgressSpinnerModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToolbarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './inter-station-transfer.html',
  styleUrls: ['./inter-station-transfer.css']
})
export class InterStationTransferComponent implements OnInit {
  transfers: InterStationTransferAdminDto[] = [];
  loading = false;
  approveDialogVisible = false;
  selectedTransfer: InterStationTransferAdminDto | null = null;
  approveForm: FormGroup;
  submitting = false;

  // Stats
  get pendingCount(): number {
    return this.transfers.filter(t => t.status === 'Pending').length;
  }

  get approvedCount(): number {
    return this.transfers.filter(t => t.status === 'Approved').length;
  }

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private transferService: InterStationTransferService
  ) {
    this.approveForm = this.fb.group({
      approvedByUserId: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.loadTransfers();
    this.getUserIdFromToken();
  }

  loadTransfers() {
    this.loading = true;
    
    this.transferService .getAllTransfers().subscribe({
      next: (data) => {
        this.transfers = data;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách chuyển trạm'
        });
        this.loading = false;
      }
    });

  }

  showApproveDialog(transfer: InterStationTransferAdminDto) {
    if (!transfer.canApprove) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Chỉ có thể phê duyệt yêu cầu đang chờ xử lý'
      });
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

    console.log('User ID decoded:', userId); 

    return userId;
  } catch (error) {
    console.error('Token không hợp lệ:', error);
    return null;
  }
}

  approveTransfer() {
    const currentUserId = this.getUserIdFromToken();
    if (!currentUserId) {
    this.messageService.add({
      severity: 'error',
      summary: 'Lỗi xác thực',
      detail: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.'
    });
    return;
  }
    if (this.selectedTransfer) {
      this.submitting = true;
      const dto: ApproveTransferDto = {
        approvedByUserId: currentUserId
      };
        this.transferService.approveTransfer(this.selectedTransfer.transferId, dto).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: response || 'Đã phê duyệt yêu cầu chuyển trạm'
        });
        this.submitting = false;
        this.approveDialogVisible = false;
        this.loadTransfers();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: err.error || 'Không thể phê duyệt yêu cầu'
        });
        this.submitting = false;
      }
    });
  }

      // Mock success
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Transfer approved.'
        });
        this.submitting = false;
        this.approveDialogVisible = false;
        this.loadTransfers();
      }, 1000);
    
  }

  getStatusSeverity(status: string): TagSeverity {
    const severityMap: { [key: string]: TagSeverity } = {
      'Pending': 'warn',
      'Approved': 'success',
      'Rejected': 'danger',
      'Completed': 'info'
    };
    return severityMap[status] || 'secondary';
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
    return date.toLocaleString('vi-VN', {
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
  }

  exportData() {
    this.messageService.add({
      severity: 'info',
      summary: 'Xuất dữ liệu',
      detail: 'Chức năng đang được phát triển'
    });
  }
}