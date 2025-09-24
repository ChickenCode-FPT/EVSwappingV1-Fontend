import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  submitted = false;
  message = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.forgotForm.invalid) return;

    const email = this.forgotForm.value.email;
    this.authService.forgotPassword(email).subscribe({
      next: res => {
        this.message = 'Nếu email tồn tại, bạn sẽ nhận được link reset.';
      },
      error: err => {
        this.message = 'Có lỗi xảy ra. Vui lòng thử lại.';
      }
    });
  }
}
