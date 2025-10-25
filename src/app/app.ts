import { Component, signal } from '@angular/core';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    RouterModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] 
})
export class App {
  protected readonly title = signal('my-angular-appV2');
  constructor(public router: Router) {}
  isAdminPage(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
