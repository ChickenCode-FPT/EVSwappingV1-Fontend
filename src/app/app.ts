// app.component.ts
import { Component, signal } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
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
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-angular-appV2');
  currentUrl: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  isStaffRoute() {
    return this.currentUrl.startsWith('/staff')  || this.currentUrl.startsWith('/admin') ;
  }
  // isAdminRoute(){
  //   return this.currentUrl.startsWith('/admin');
  // }
}
