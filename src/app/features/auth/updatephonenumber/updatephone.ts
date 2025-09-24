import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-phone',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './updatephone.html',
  styleUrls: ['./updatephone.css']
})
export class UpdatePhoneComponent {
  phoneForm: FormGroup;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    });

    const storedEmail = localStorage.getItem('email');
    if (storedEmail) this.email = storedEmail;
  }

  onSubmit() {
    if (this.phoneForm.valid) {
      const phoneNumber = this.phoneForm.value.phoneNumber;

      this.authService.updatePhone(this.email, phoneNumber).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token.token);
          localStorage.setItem('refreshToken', res.token.refreshToken);
          localStorage.setItem('refreshTokenExpiry', res.token.refreshTokenExpiry);
            
          console.log('token:', res.token.token);
          const payload = JSON.parse(atob(res.token.token.split('.')[1]));
          localStorage.setItem('fullname', payload.fullname);
          localStorage.setItem('roles', payload.roles);

          this.snackBar.open('Phone updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.snackBar.open('Update failed', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
          console.error(err);
        }
      });
    }
  }
}
