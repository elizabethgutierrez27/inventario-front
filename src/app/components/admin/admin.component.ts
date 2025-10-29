import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  sidebarCollapsed = false; // false = expandida, true = colapsada (solo íconos)

  constructor(private router: Router) {}

  onSidebarToggled() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}