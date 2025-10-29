import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barra',
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.css'],
})
export class BarraComponent {
  @Input() sidebarCollapsed: boolean = false;
  @Output() sidebarToggled = new EventEmitter<void>();

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarToggled.emit();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}