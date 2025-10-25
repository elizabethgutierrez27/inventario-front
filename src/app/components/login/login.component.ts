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
  mensaje: string = '';
  pasoCodigo: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.correo || !this.password) {
      this.mensaje = 'Por favor ingresa correo y contraseña.';
      return;
    }

    this.authService.login(this.correo, this.password).subscribe({
      next: (res: any) => {
        console.log('[LoginComponent] Respuesta del servidor:', res);

        if (res.codigo === 0) {
          if (res.mensaje.includes('Ya existe una sesión activa')) {
            this.guardarTokenYRedirigir(res.token);
            return;
          }

          this.mensaje = 'Código de verificación enviado a tu correo.';
          this.pasoCodigo = true;
        } else {
          this.mensaje = res.error?.mensaje || 'Error al iniciar sesión.';
        }
      },
      error: (err) => {
        console.error('[LoginComponent] Error de login:', err);
        this.mensaje = 'Ocurrió un error en el servidor.';
      }
    });
  }

  onVerificarCodigo() {
    if (!this.codigo) {
      this.mensaje = 'Por favor ingresa el código de verificación.';
      return;
    }

    this.authService.verificarCodigo(this.correo, this.codigo).subscribe({
      next: (res: any) => {
        console.log('[LoginComponent] Respuesta verificación:', res);

        if (res.codigo === 0) {
          this.guardarTokenYRedirigir(res.token);
        } else {
          this.mensaje = res.error?.mensaje || 'Código incorrecto.';
        }
      },
      error: (err) => {
        console.error('[LoginComponent] Error verificación:', err);
        this.mensaje = 'Ocurrió un error en el servidor.';
      }
    });
  }

  private guardarTokenYRedirigir(token: string) {
    localStorage.setItem('token', token);

    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    const rol = payload.rol;
    this.mensaje = `Sesión iniciada como ${rol}. Redirigiendo...`;

    if (rol === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/personal']);
    }
  }
}
