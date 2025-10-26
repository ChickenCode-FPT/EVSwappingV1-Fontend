import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BatteryHealthLogService, BatteryHealthLog } from '../../../core/battery-health-logs.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { HttpClient } from '@angular/common/http';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { DatePicker } from "primeng/datepicker";
@Component({
  selector: 'app-battery-health-logs',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    FormsModule,
    ConfirmDialogModule,
    ToastModule,
    SidebarComponent,
    SelectModule,
    CardModule,
    DatePicker
],
  providers: [ConfirmationService, MessageService],
  templateUrl: './battery-health.html',
  styleUrls: ['./battery-health.css'],
})
export class BatteryHealthLogsComponent implements OnInit {
    serialNumbers: any[] = [];
  logs: BatteryHealthLog[] = [];
  selectedLog: BatteryHealthLog | null = null;
  visible = false;
  isEdit = false;

  constructor(
    private service: BatteryHealthLogService,
    private confirm: ConfirmationService,
    private toast: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadLogs();
    this.loadSerialNumbers();
  }

  loadLogs() {
    this.service.getAll().subscribe({
      next: (data) => (this.logs = data.map(log => ({
        ...log,
        recordedAt: new Date(log.recordedAt)
      }))),
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load logs' })
    });
  }

  openNew() {
    this.selectedLog = { batteryHealthLogId: 0,serialNumber : '', batteryId: 0, recordedAt: new Date(), soH:0 , cycleCount: 0, temperature: 0, notes: '' };
    this.isEdit = false;
    this.visible = true;
  }

  edit(log: BatteryHealthLog) {
    this.selectedLog = { ...log };
    this.isEdit = true;
    this.visible = true;
  }

  save() {
    if (!this.selectedLog) return;
    const action = this.isEdit
      ? this.service.update(this.selectedLog!.batteryHealthLogId!, this.selectedLog)
      : this.service.add(this.selectedLog);

    action.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Success', detail: this.isEdit ? 'Updated' : 'Added' });
        this.visible = false;
        this.loadLogs();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save log' })
    });
  }

  delete(log: BatteryHealthLog) {
    this.confirm.confirm({
      message: `Delete log #${log.batteryHealthLogId}?`,
      accept: () => {
        this.service.delete(log.batteryHealthLogId!).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Log deleted' });
            this.loadLogs();
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete log' })
        });
      }
    });
  }
  loadSerialNumbers() {
    this.http.get<any[]>('https://localhost:7292/api/BatteryHealthLogs')
      .subscribe({
        next: (data) => {
          const serialSet = new Set<string>();

          data.forEach(item => {
            if (item.serialNumber) serialSet.add(item.serialNumber);
          });

          this.serialNumbers = Array.from(serialSet).map(sn => ({
            label: sn,
            value: sn
          }));
        },
        error: (err) => console.error('Failed to load serial numbers', err)
      });
  }
}
