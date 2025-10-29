import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-barra',
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.css']
})
export class BarraComponent {
  @Output() sidebarStateChange = new EventEmitter<boolean>();
  sidebarVisible = true;

  constructor(private router: Router, private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarStateChange.emit(this.sidebarVisible);
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log('[BarraComponent] Logout exitoso:', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('[BarraComponent] Error logout:', err);
        // Igual redirigimos aunque haya error
        this.router.navigate(['/login']);
      }
    });
  }
}
