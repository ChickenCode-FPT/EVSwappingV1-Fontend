import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  protected readonly welcomeMessage = 'Welcome to the EV Swap Platform!';
  constructor(private router: Router) { }

  ngOnInit() {
    const roles = localStorage.getItem('roles');

    if (roles && roles.includes('Staff')) {
      this.router.navigate(['/staff/battery/warehouse']);
    }
  }
}
