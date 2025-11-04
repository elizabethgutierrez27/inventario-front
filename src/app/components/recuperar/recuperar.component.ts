import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RecuperarService } from '../../services/recuperar.service';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent {

  correo: string = '';
  codigo: string = '';
  nuevaPassword: string = '';
  codigoSolicitado: boolean = false; // Paso 2

  // Propiedades de notificación
  notificacionVisible = false;
  notificacionMensaje = '';
  notificacionTipo: 'success' | 'error' = 'success';

  constructor(private recuperarService: RecuperarService, private router: Router) {}

  solicitarCodigo() {
    this.recuperarService.solicitarReset(this.correo).subscribe({
      next: res => {
        this.mostrarNotificacion(
          res.mensaje + (res.otp ? ` (OTP: ${res.otp})` : ''),
          'success'
        );
        if (res.codigo === 0) {
          this.codigoSolicitado = true; // Activar paso 2
        }
      },
      error: err => this.mostrarNotificacion('Error solicitando código', 'error')
    });
  }

  restablecerPassword() {
    if (!this.codigo || !this.nuevaPassword) {
      this.mostrarNotificacion('Por favor completa todos los campos', 'error');
      return;
    }

    this.recuperarService.resetConCodigo(this.correo, this.codigo, this.nuevaPassword).subscribe({
      next: (res: any) => {
        const mensaje = res.mensaje || (res.codigo === 0 ? 'Contraseña restablecida con éxito' : 'Error desconocido');
        const tipo: 'success' | 'error' = res.codigo === 0 ? 'success' : 'error';
        this.mostrarNotificacion(mensaje, tipo);

        if (res.codigo === 0) {
          this.codigoSolicitado = false;
          this.codigo = '';
          this.nuevaPassword = '';

          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
      },
      error: (err) => {
        console.error('Error al restablecer contraseña', err);
        this.mostrarNotificacion('Ocurrió un error en el servidor', 'error');
      }
    });
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.notificacionMensaje = mensaje;
    this.notificacionTipo = tipo;
    this.notificacionVisible = true;

    setTimeout(() => this.notificacionVisible = false, 5000);
  }
}
