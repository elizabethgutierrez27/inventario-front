import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // corregido styleUrl -> styleUrls
})
export class AppComponent implements OnInit {
  sidebarCollapsed = false; // Control global del estado del sidebar
  showSidebar = true;


  notifVisible = false;
  notifMensaje = '';
  notifTipo: 'success' | 'error' = 'success'; // <-- tipo corregido

  constructor(private router: Router, private authService: AuthService) {
    // Controla el sidebar según la ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const noSidebarRoutes = ['/login', '/recuperar', '/']; // agregamos recuperar
        this.showSidebar = !noSidebarRoutes.includes(event.url);
      }
    });
  }

  ngOnInit(): void {
    // Notificación de sesión
    if (typeof window !== 'undefined') {
      const token = this.authService.obtenerToken();
      const tiempoRestante = this.authService.obtenerTiempoRestante();

      if (token && tiempoRestante > 0) {
        this.mostrarNotificacion(`Tienes ${tiempoRestante} minutos restantes de sesión.`);
      }
    }
  }

  onSidebarToggled() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }


  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.notifMensaje = mensaje;
    this.notifTipo = tipo;
    this.notifVisible = true;
    setTimeout(() => this.notifVisible = false, 5000);
  }
}
