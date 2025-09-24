import { Component } from "@angular/core";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class Home {
    protected readonly welcomeMessage = 'Welcome to the EV Swap Platform!';
}