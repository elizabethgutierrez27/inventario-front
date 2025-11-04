import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo: string = '';
  password: string = '';
  codigo: string = '';
  pasoCodigo: boolean = false;

  // Propiedades de notificación
  notificacionVisible = false;
  notificacionMensaje = '';
  notificacionTipo: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.correo || !this.password) {
      this.mostrarNotificacion('Por favor ingresa correo y contraseña.', 'error');
      return;
    }

    this.authService.login(this.correo, this.password).subscribe({
      next: (res: any) => {
  if (res.codigo === 0) {
    if (res.mensaje?.includes('Ya existe una sesión activa')) {
      this.guardarTokenYRedirigir(res.token);
      return;
    }

    this.pasoCodigo = true;
    this.mostrarNotificacion('Código de verificación enviado a tu correo.', 'success');
  } else {
    // Extraer solo los mensajes de error
    const errores = res.error?.detalle?.map((e: any) => e.mensaje) || [res.error?.mensaje || 'Error al iniciar sesión.'];

    // Mostrar cada mensaje por separado en la notificación
    this.mostrarNotificacion(errores.join('\n'), 'error');
  }
}

,
      error: () => {
        this.mostrarNotificacion('Ocurrió un error en el servidor.', 'error');
      }
    });
  }

  onVerificarCodigo() {
    if (!this.codigo) {
      this.mostrarNotificacion('Por favor ingresa el código de verificación.', 'error');
      return;
    }

    this.authService.verificarCodigo(this.correo, this.codigo).subscribe({
      next: (res: any) => {
        if (res.codigo === 0) {
          this.guardarTokenYRedirigir(res.token);

          if (res.tiempo_restante_min !== undefined) {
            this.mostrarNotificacion(
              `Autenticación exitosa. Te quedan ${res.tiempo_restante_min} minutos de sesión.`,
              'success'
            );
          }
        } else {
          const errores = Array.isArray(res.error?.mensaje)
            ? res.error.mensaje.join(', ')
            : res.error?.mensaje;
          this.mostrarNotificacion(errores || 'Código incorrecto.', 'error');
        }
      },
      error: () => {
        this.mostrarNotificacion('Ocurrió un error en el servidor.', 'error');
      }
    });
  }

  private guardarTokenYRedirigir(token: string) {
    localStorage.setItem('token', token);

    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    const rol = payload.rol;

    this.mostrarNotificacion(`Sesión iniciada como ${rol}. Redirigiendo...`, 'success');

    if (rol === 'admin') this.router.navigate(['/admin']);
    else this.router.navigate(['/personal']);
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.notificacionMensaje = mensaje;
    this.notificacionTipo = tipo;
    this.notificacionVisible = true;

    setTimeout(() => this.notificacionVisible = false, 5000);
  }
}
