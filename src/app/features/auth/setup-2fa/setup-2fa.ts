import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-setup-2fa',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './setup-2fa.html',
  styleUrls: ['./setup-2fa.css']
})
export class Setup2FAComponent implements OnInit {
  email = 'tranduy256789@gmail.com'; 
  secretKey = '';
  otpauthUrl = '';
  totpForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) {
    this.totpForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    this.authService.get2FASetup(this.email).subscribe({
      next: (res: any) => {
        this.secretKey = res.key;
        this.otpauthUrl = res.otpauthUrl;
      },
      error: () => this.errorMessage = 'Không thể lấy QR code'
    });
  }

  onSubmit() {
    if (this.totpForm.invalid) return;

    const token = this.totpForm.value.token;
    this.authService.enable2FA(this.email, token).subscribe({
      next: (res: any) => {
        this.successMessage = res.message;
        this.router.navigate(['/two-factor'])
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error || 'Mã 2FA không hợp lệ';
      }
    });
  }
}
