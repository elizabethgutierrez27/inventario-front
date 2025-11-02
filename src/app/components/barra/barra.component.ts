import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-barra',
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.css'],
})
export class BarraComponent {
  @Input() sidebarCollapsed: boolean = false;
  @Output() sidebarToggled = new EventEmitter<void>();
  @Output() sidebarStateChange = new EventEmitter<boolean>();

  sidebarVisible = true;

  constructor(private router: Router, private authService: AuthService) {}

  toggleSidebar() {
    // Cambia el estado de visibilidad
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarStateChange.emit(this.sidebarVisible);
    this.sidebarToggled.emit();
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log('[BarraComponent] Logout exitoso:', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('[BarraComponent] Error logout:', err);
        // Redirigir aunque haya error
        this.router.navigate(['/login']);
      }
    });
  }
}
