import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionPackageService, PackageDto, CreatePackageDto, UpdatePackageDto } from '../../../core/subscription-package.service';
import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { SidebarComponent } from "../../../shared/sidebar/sidebar";

@Component({
  selector: 'app-package-management',
  templateUrl: './subscription-package.html',
  styleUrls: ['./subscription-package.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    SidebarComponent,
    CommonModule
  ]
})
export class PackageManagementComponent implements OnInit {
  packages: PackageDto[] = [];
  loading = false;
  displayDialog = false;
  isEdit = false;
  packageForm!: FormGroup;
  selectedPackage?: PackageDto;
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

  confirmDialog = {
    show: false,
    message: '',
    accept: () => {},
    reject: () => {}
  };

  billingCycles = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Yearly', value: 'Yearly' }
  ];

  constructor(
    private subscriptionPackage: SubscriptionPackageService,
    private fb: FormBuilder
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
      console.log('API response packages:', res); // ✅ in ra toàn bộ mảng package
      res.forEach(pkg => console.log('Package status:', pkg.status)); // ✅ in ra status từng package

      this.packages = res;
      this.totalPages = Math.ceil(this.packages.length / this.itemsPerPage);
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      this.showToast('error', 'Error', err?.error?.message || err.message || 'Failed to load packages');
    }
  });
}

  get paginatedPackages() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.packages.slice(start, end);
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

  openCreateDialog() {
    this.isEdit = false;
    this.packageForm.reset({ price: 0, includedSwaps: 0 });
    this.packageForm.get('billingCycle')?.enable();
    this.packageForm.get('includedSwaps')?.enable();
    this.displayDialog = true;
  }

  openEditDialog(pkg: PackageDto) {
    this.isEdit = true;
    this.selectedPackage = pkg;
    this.packageForm.patchValue({
      name: pkg.name,
      price: pkg.price,
    });
    this.packageForm.get('billingCycle')?.disable();
    this.packageForm.get('includedSwaps')?.disable();
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

      this.subscriptionPackage.updatePackage(this.selectedPackage.packageId, update).subscribe({
        next: () => {
          this.showToast('success', 'Updated', 'Package updated successfully');
          this.displayDialog = false;
          this.loadPackages();
        },
        error: (err) => this.showToast('error', 'Error', err?.error?.message || err.message)
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
          this.showToast('success', 'Created', 'Package created successfully');
          this.displayDialog = false;
          this.loadPackages();
        },
        error: (err) => this.showToast('error', 'Error', err?.error?.message || err.message)
      });
    }
  }

  confirmInactive(pkg: PackageDto) {
    this.confirmDialog = {
      show: true,
      message: `Are you sure you want to set package "${pkg.name}" to inactive?`,
      accept: () => {
        this.subscriptionPackage.inactivePackage(pkg.packageId).subscribe({
          next: () => {
            this.showToast('success', 'Done', 'Package set to inactive');
            this.loadPackages();
          },
          error: (err) => this.showToast('error', 'Error', err?.error?.message || err.message)
        });
        this.confirmDialog.show = false;
      },
      reject: () => {
        this.confirmDialog.show = false;
      }
    };
  }

  confirmReactivate(pkg: PackageDto) {
    this.confirmDialog = {
      show: true,
      message: `Reactivate package "${pkg.name}"?`,
      accept: () => {
        this.subscriptionPackage.reactivePackage(pkg.packageId).subscribe({
          next: () => {
            this.showToast('success', 'Done', 'Package reactivated');
            this.loadPackages();
          },
          error: (err) => this.showToast('error', 'Error', err?.error?.message || err.message)
        });
        this.confirmDialog.show = false;
      },
      reject: () => {
        this.confirmDialog.show = false;
      }
    };
  }

  confirmPublish(pkg: PackageDto) {
    this.confirmDialog = {
      show: true,
      message: `Publish package "${pkg.name}"?`,
      accept: () => {
        this.subscriptionPackage.publishPackage(pkg.packageId).subscribe({
          next: () => {
            this.showToast('success', 'Published', 'Package published successfully');
            this.loadPackages();
          },
          error: (err) => this.showToast('error', 'Error', err?.error?.message || err.message)
        });
        this.confirmDialog.show = false;
      },
      reject: () => {
        this.confirmDialog.show = false;
      }
    };
  }

 statusLabel(status: string): string {
  switch (status) {
    case "Draft": return "Draft";
    case "Active": return "Active";
    case "Inactive": return "Inactive";
    default: return "Unknown";
  }
}


  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Draft';
      case 1: return 'Active';
      case 2: return 'Inactive';
      default: return 'Unknown';
    }
  }

  showToast(severity: string, summary: string, detail: string) {
    this.toast = { show: true, severity, summary, detail };
    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }
}