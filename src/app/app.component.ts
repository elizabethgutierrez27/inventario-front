import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  sidebarVisible = true;
  showSidebar = true;

  constructor(private router: Router,private authService: AuthService, ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Rutas donde NO quieres mostrar la barra
        const noSidebarRoutes = ['/login', '/'];
        this.showSidebar = !noSidebarRoutes.includes(event.url);
      }
    });
  }

   onSidebarStateChange(visible: boolean) {
    this.sidebarVisible = visible;
  }

  notifVisible = false;
notifMensaje = '';
notifTipo = 'success';

mostrarNotificacion(mensaje: string, tipo = 'success') {
  this.notifMensaje = mensaje;
  this.notifTipo = tipo;
  this.notifVisible = true;
  setTimeout(() => this.notifVisible = false, 5000);
}

ngOnInit(): void {
  if (typeof window !== 'undefined') {
    const token = this.authService.obtenerToken();
    const tiempoRestante = this.authService.obtenerTiempoRestante();

    if (token && tiempoRestante > 0) {
      this.mostrarNotificacion(`Tienes ${tiempoRestante} minutos restantes de sesión.`);
    }
  }
}

}
