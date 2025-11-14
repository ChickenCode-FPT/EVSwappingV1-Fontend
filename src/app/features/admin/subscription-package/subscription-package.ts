import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SubscriptionPackageService, PackageDto, CreatePackageDto, UpdatePackageDto } from '../../../core/subscription-package.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Select } from "primeng/select";
import { DatePipe,CurrencyPipe,CommonModule } from '@angular/common';
import { SidebarComponent } from "../../../shared/sidebar/sidebar";
@Component({
  selector: 'app-package-management',
  templateUrl: './subscription-package.html',
  styleUrls: ['./subscription-package.css'],
  standalone: true,
    imports: [
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule,
    Select,
    DatePipe,
    CurrencyPipe,
    SidebarComponent,
    CommonModule
],
    providers: [ConfirmationService, MessageService]
})
export class PackageManagementComponent implements OnInit {
  packages: PackageDto[] = [];
  loading = false;

  displayDialog = false;
  isEdit = false;

  packageForm!: FormGroup;
  selectedPackage?: PackageDto;

  billingCycles = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Yearly', value: 'Yearly' }
  ];

  constructor(
    private subscriptionPackage: SubscriptionPackageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPackages();
  }

  initForm() {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      billingCycle: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      includedSwaps: [0]
    });
  }

  loadPackages() {
    this.loading = true;
    this.subscriptionPackage.getAllPackages().subscribe({
      next: (res) => {
        this.packages = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err.message || 'Failed to load packages' });
      }
    });
  }

  openCreateDialog() {
    this.isEdit = false;
    this.packageForm.reset({ price: 0, includedSwaps: 0 });
    this.displayDialog = true;
  }

  openEditDialog(pkg: PackageDto) {
    this.isEdit = true;
    this.selectedPackage = pkg;
    this.packageForm.patchValue({
      name: pkg.name,
      price: pkg.price,
    });
    this.displayDialog = true;
  }

  save() {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    const form = this.packageForm.value;

    if (this.isEdit && this.selectedPackage) {
      const update: UpdatePackageDto = {
        name: form.name,
        price: form.price
      };
        this.packageForm.get('billingCycle')?.disable();
        this.packageForm.get('includedSwaps')?.disable();
      this.subscriptionPackage.updatePackage(this.selectedPackage.packageId, update).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Package updated' });
          this.displayDialog = false;
          this.loadPackages();
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err.message })
      });
    } else {
      const create: CreatePackageDto = {
        name: form.name,
        billingCycle: form.billingCycle, 
        price: form.price,
        includedSwaps: form.includedSwaps
      };

      this.subscriptionPackage.createPackage(create).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Package created' });
          this.displayDialog = false;
          this.loadPackages();
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err.message })
      });
    }
  }

  confirmInactive(pkg: PackageDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to set package "${pkg.name}" to inactive?`,
      accept: () => {
        this.subscriptionPackage.inactivePackage(pkg.packageId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Done', detail: 'Package set to inactive' });
            this.loadPackages();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err.message })
        });
      }
    });
  }

  confirmReactivate(pkg: PackageDto) {
    this.confirmationService.confirm({
      message: `Reactivate package "${pkg.name}"?`,
      accept: () => {
        this.subscriptionPackage.reactivePackage(pkg.packageId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Done', detail: 'Package reactivated' });
            this.loadPackages();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err.message })
        });
      }
    });
  }

  confirmPublish(pkg: PackageDto) {
    this.confirmationService.confirm({
      message: `Publish package "${pkg.name}"?`,
      accept: () => {
        this.subscriptionPackage.publishPackage(pkg.packageId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Published', detail: 'Package published' });
            this.loadPackages();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || err.message })
        });
      }
    });
  }

  statusLabel(status: string) {
    switch (status) {
      case "Draft": return 0;
      case "Active": return 1;
      case "Inactive": return 2;
      default: return 'Unknown';
    }
  }
}




