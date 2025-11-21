import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const roles = localStorage.getItem('roles');

  // Nếu ĐÃ đăng nhập rồi thì không cho vào trang Login nữa
  if (token && roles) {
    if (roles.includes('Admin')) {
      router.navigate(['/admin/dashboard']);
    } else if (roles.includes('Staff')) {
      router.navigate(['/staff']);
    } else {
      router.navigate(['/home']);
    }
    return false; 
  }

  return true; 
};