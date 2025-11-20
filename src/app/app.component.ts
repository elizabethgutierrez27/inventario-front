import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  sidebarCollapsed = false;
  showSidebar = true;
  rol: string | null = null;

  notifVisible = false;
  notifMensaje = '';
  notifTipo: 'success' | 'error' = 'success';

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const noSidebarRoutes = ['/login', '/recuperar', '/'];
        this.showSidebar = !noSidebarRoutes.includes(event.url);
      }
    });
  }

  ngOnInit(): void {
  const token = this.authService.obtenerToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.rol === 'admin') {
        this.rol = 'admin';
      } else {
        this.rol = 'user'; // cualquier otro rol lo tratamos como 'user'
      }
    } catch (err) {
      console.error('Token inválido', err);
      this.rol = 'user';
    }
  } else {
    this.rol = null;
  }

  const tiempoRestante = this.authService.obtenerTiempoRestante();
  if (this.rol && tiempoRestante > 0) {
    this.mostrarNotificacion(`Tienes ${tiempoRestante} minutos restantes de sesión.`);
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
