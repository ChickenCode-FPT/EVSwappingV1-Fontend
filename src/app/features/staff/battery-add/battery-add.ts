import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BatteryService } from '../services/battery-service';
import { Battery } from '../../models/battery.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-battery-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './battery-add.html',
  styleUrls: ['./battery-add.css']
})
export class BatteryAdd {
  batteryForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';

  private batteryService = inject(BatteryService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.batteryForm = this.fb.group({
      serialNumber: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Z0-9-]+$/)
      ]],
      batteryModelId: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      currentSoH: [null, [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]],
      cycleCount: [null, [
        Validators.required,
        Validators.min(0),
        Validators.max(10000)
      ]],
      status: ['', Validators.required],
      lastMaintenance: [null],
    });
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    if (this.batteryForm.invalid) {
      Object.keys(this.batteryForm.controls).forEach(key => {
        this.batteryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = false;
    this.errorMessage = '';

    const newBattery: Battery = {
      ...this.batteryForm.value,
      createdAt: new Date().toISOString(),
    };

    this.batteryService.addBattery(newBattery).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;

        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          this.router.navigate(['/staff/battery/warehouse']);
        }, 2000);
      },
      error: (error) => {
        console.error('Failed to add battery:', error);
        this.isSubmitting = false;
        this.submitError = true;
        this.errorMessage = error?.error?.message || 'Failed to add battery. Please try again.';

        // Hide error message after 5 seconds
        setTimeout(() => {
          this.submitError = false;
        }, 5000);
      }
    });
  }

  // Helper method to get form control errors
  getErrorMessage(controlName: string): string {
    const control = this.batteryForm.get(controlName);
    
    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(controlName)} is required`;
    }

    if (control.errors['min']) {
      return `Minimum value is ${control.errors['min'].min}`;
    }

    if (control.errors['max']) {
      return `Maximum value is ${control.errors['max'].max}`;
    }

    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.errors['pattern']) {
      return 'Invalid format (use A-Z, 0-9, and hyphens only)';
    }

    return 'Invalid value';
  }

  // Get field label for error messages
  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      serialNumber: 'Serial Number',
      batteryModelId: 'Battery Model ID',
      currentSoH: 'State of Health',
      cycleCount: 'Cycle Count',
      status: 'Status',
      lastMaintenance: 'Last Maintenance Date'
    };
    return labels[controlName] || controlName;
  }

  // Reset form
  resetForm() {
    this.batteryForm.reset();
    this.submitSuccess = false;
    this.submitError = false;
    this.errorMessage = '';
  }

  // Check if field has error
  hasError(controlName: string): boolean {
    const control = this.batteryForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  // Check if field is valid
  isValid(controlName: string): boolean {
    const control = this.batteryForm.get(controlName);
    return !!(control?.valid && control?.touched);
  }
}