import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService } from '../service/driver.service';

@Component({
  selector: 'app-driver-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-register.component.html',
  styleUrls: ['./driver-register.component.css']
})
export class DriverRegisterComponent {
  private api = inject(DriverService);
  private router = inject(Router);

  preferredPaymentMethod = 'VNPAY';
  loading = false;
  success = false;
  errorMessage = '';

  unsupportedWarning = '';

  onPaymentChange() {
    if (this.preferredPaymentMethod !== 'VNPAY') {
      this.unsupportedWarning = "Phương thức này chưa được hỗ trợ. Vui lòng chọn VNPAY.";
    } else {
      this.unsupportedWarning = "";
    }
  }

  submit() {
    if (this.preferredPaymentMethod !== 'VNPAY') {
      this.errorMessage = "Chỉ hỗ trợ VNPAY ở thời điểm hiện tại.";
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.api.registerDriver({
      preferredPaymentMethod: this.preferredPaymentMethod
    })
    .subscribe({
      next: () => {
        this.success = true;
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/vehicles/add']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || "Đăng ký thất bại.";
        this.loading = false;
      }
    });
  }
}
