// google-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  template: '<p>Processing Google login...</p>'
})
export class GoogleCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token'); // string
  const requirePhone = url.searchParams.get('requirePhone')?.toLowerCase() === 'true';
  const email = url.searchParams.get('email');


  if (token) {
    localStorage.setItem('token', token);

    // decode JWT và lưu thông tin user
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('fullname', payload.fullname);
    localStorage.setItem('roles', payload.roles);
    if (email) localStorage.setItem('email', email);
  }

  if (requirePhone) {
    this.router.navigate(['/update-phone']);
  } else {
    this.router.navigate(['/home']);
  }
}

}
