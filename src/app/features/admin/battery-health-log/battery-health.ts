import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatteryHealthLogService, BatteryHealthLog } from '../../../core/battery-health-logs.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-battery-health-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
  ],
  template: `
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <app-sidebar class="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0"></app-sidebar>

      <!-- Main Content -->
      <div class="ml-64 flex-1 p-8">
        
        <!-- Toast Notifications -->
        <div *ngIf="toast.visible" 
             [ngClass]="toast.severity === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'"
             class="fixed top-4 right-4 z-50 border-l-4 p-4 rounded-lg shadow-lg animate-slide-in">
          <div class="flex items-center gap-3">
            <span *ngIf="toast.severity === 'success'" class="text-green-500 text-xl">✓</span>
            <span *ngIf="toast.severity === 'error'" class="text-red-500 text-xl">✕</span>
            <div>
              <p class="font-semibold" [ngClass]="toast.severity === 'success' ? 'text-green-800' : 'text-red-800'">
                {{ toast.summary }}
              </p>
              <p class="text-sm" [ngClass]="toast.severity === 'success' ? 'text-green-700' : 'text-red-700'">
                {{ toast.detail }}
              </p>
            </div>
            <button (click)="toast.visible = false" class="ml-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>
        </div>

        <!-- Confirm Dialog -->
        <div *ngIf="confirmDialog.visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span class="text-yellow-600 text-2xl">⚠</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Confirm</h3>
                  <p class="text-sm text-gray-600">{{ confirmDialog.message }}</p>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button (click)="confirmDialog.visible = false" 
                        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                  Cancel
                </button>
                <button (click)="confirmDialog.accept()" 
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Container -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Battery Health Logs</h2>
            <button (click)="openNew()" 
                    class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              <span class="text-xl">+</span>
              New Log
            </button>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">ID</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Serial Number</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Battery ID</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Recorded At</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">SoH</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Cycle Count</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Temperature</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Notes</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of paginatedLogs" 
                    class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 text-gray-800 text-sm">{{ log.batteryHealthLogId }}</td>
                  <td class="py-3 px-4 text-gray-800 text-sm">{{ log.serialNumber }}</td>
                  <td class="py-3 px-4 text-gray-800 text-sm">{{ log.batteryId }}</td>
                  <td class="py-3 px-4 text-gray-600 text-sm">{{ formatDate(log.recordedAt) }}</td>
                  <td class="py-3 px-4 text-gray-800 text-sm">{{ log.soH }}%</td>
                  <td class="py-3 px-4 text-gray-800 text-sm">{{ log.cycleCount }}</td>
                  <td class="py-3 px-4 text-gray-800 text-sm">{{ log.temperature }}°C</td>
                  <td class="py-3 px-4 text-gray-600 text-sm">{{ log.notes }}</td>
                  <td class="py-3 px-4">
                    <div class="flex gap-2">
                      <button (click)="edit(log)" 
                              class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                              title="Edit">
                        ✏️
                      </button>
                      <button (click)="delete(log)" 
                              class="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="logs.length === 0">
                  <td colspan="9" class="text-center py-8 text-gray-500">No logs found.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-6" *ngIf="logs.length > 0">
            <div class="text-sm text-gray-600">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, logs.length) }} of {{ logs.length }} entries
            </div>
            <div class="flex gap-2">
              <button (click)="previousPage()" 
                      [disabled]="currentPage === 1"
                      [class.opacity-50]="currentPage === 1"
                      [class.cursor-not-allowed]="currentPage === 1"
                      class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:hover:bg-white">
                ‹
              </button>
              <button *ngFor="let page of pageNumbers" 
                      (click)="goToPage(page)"
                      [class.bg-blue-600]="page === currentPage"
                      [class.text-white]="page === currentPage"
                      [class.border-blue-600]="page === currentPage"
                      class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {{ page }}
              </button>
              <button (click)="nextPage()" 
                      [disabled]="currentPage === totalPages"
                      [class.opacity-50]="currentPage === totalPages"
                      [class.cursor-not-allowed]="currentPage === totalPages"
                      class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:hover:bg-white">
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Modal -->
    <div *ngIf="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Dialog Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">{{ isEdit ? 'Edit Log' : 'Add Log' }}</h3>
          <button (click)="visible = false" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <!-- Dialog Body -->
        <div class="p-6 space-y-4" *ngIf="selectedLog">
          <!-- Serial Number Field -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Battery Serial Number</label>
            <select [(ngModel)]="selectedLog.serialNumber" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option value="">Select Serial Number</option>
              <option *ngFor="let sn of serialNumbers" [value]="sn.value">{{ sn.label }}</option>
            </select>
          </div>

          <!-- SoH and Cycle Count Row -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700">SoH (%)</label>
              <input type="number" 
                     [(ngModel)]="selectedLog.soH" 
                     min="0" 
                     max="100" 
                     step="0.01"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700">Cycle Count</label>
              <input type="number" 
                     [(ngModel)]="selectedLog.cycleCount" 
                     min="0"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            </div>
          </div>

          <!-- Temperature Field -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Temperature (°C)</label>
            <input type="number" 
                   [(ngModel)]="selectedLog.temperature" 
                   min="0" 
                   max="100" 
                   step="0.01"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          </div>

          <!-- Recorded At Field -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Recorded At</label>
            <input type="datetime-local" 
                   [ngModel]="formatDateForInput(selectedLog.recordedAt)"
                   (ngModelChange)="selectedLog.recordedAt = parseDate($event)"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          </div>

          <!-- Notes Field -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Notes</label>
            <textarea [(ngModel)]="selectedLog.notes" 
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none">
            </textarea>
          </div>
        </div>

        <!-- Dialog Footer -->
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button (click)="visible = false" 
                  class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
            Cancel
          </button>
          <button (click)="save()" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class BatteryHealthLogsComponent implements OnInit {
  Math = Math;
  serialNumbers: any[] = [];
  logs: BatteryHealthLog[] = [];
  selectedLog: BatteryHealthLog | null = null;
  visible = false;
  isEdit = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Toast
  toast = {
    visible: false,
    severity: 'success',
    summary: '',
    detail: ''
  };

  // Confirm Dialog
  confirmDialog = {
    visible: false,
    message: '',
    accept: () => {}
  };

  constructor(
    private service: BatteryHealthLogService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadLogs();
    this.loadSerialNumbers();
  }

  get paginatedLogs() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.logs.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.logs.length / this.pageSize);
  }

  get pageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
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

  goToPage(page: number) {
    this.currentPage = page;
  }

  showToast(severity: string, summary: string, detail: string) {
    this.toast = { visible: true, severity, summary, detail };
    setTimeout(() => {
      this.toast.visible = false;
    }, 3000);
  }

  loadLogs() {
    this.service.getAll().subscribe({
      next: (data) => (this.logs = data.map(log => ({
        ...log,
        recordedAt: new Date(log.recordedAt)
      }))),
      error: () => this.showToast('error', 'Error', 'Failed to load logs')
    });
  }

  openNew() {
    this.selectedLog = { 
      batteryHealthLogId: 0,
      serialNumber: '', 
      batteryId: 0, 
      recordedAt: new Date(), 
      soH: 0, 
      cycleCount: 0, 
      temperature: 0, 
      notes: '' 
    };
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
        this.showToast('success', 'Success', this.isEdit ? 'Updated' : 'Added');
        this.visible = false;
        this.loadLogs();
      },
      error: () => this.showToast('error', 'Error', 'Failed to save log')
    });
  }

  delete(log: BatteryHealthLog) {
    this.confirmDialog = {
      visible: true,
      message: `Delete log #${log.batteryHealthLogId}?`,
      accept: () => {
        this.service.delete(log.batteryHealthLogId!).subscribe({
          next: () => {
            this.showToast('success', 'Deleted', 'Log deleted');
            this.confirmDialog.visible = false;
            this.loadLogs();
          },
          error: () => {
            this.showToast('error', 'Error', 'Failed to delete log');
            this.confirmDialog.visible = false;
          }
        });
      }
    };
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}