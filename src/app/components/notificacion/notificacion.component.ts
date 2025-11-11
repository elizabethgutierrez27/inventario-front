import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-notificacion',
  template: `
    <div *ngIf="visible" class="notificacion" [ngClass]="[tipo, showClass]">
      <ng-container *ngIf="tipo === 'error'">
        <h4 *ngIf="errores.length > 1">Se encontraron errores:</h4>
        <ul *ngIf="errores.length > 0">
          <li *ngFor="let e of errores">{{ e }}</li>
        </ul>
        <span *ngIf="errores.length === 1">{{ errores[0] }}</span>
      </ng-container>

      <ng-container *ngIf="tipo === 'success'">
        {{ mensaje }}
        <div *ngIf="otp" class="otp-container">
          <span>Código OTP: <b>{{ otp }}</b></span>
          <button (click)="copiarOTP()">Copiar</button>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./notificacion.component.css']
})
export class NotificacionComponent implements OnChanges {
  @Input() visible = false;
  @Input() mensaje = '';
  @Input() tipo: 'success' | 'error' = 'success';
  @Input() otp?: string; // Para mostrar el código OTP

  errores: string[] = [];
  showClass = 'show';

  ngOnChanges() {
    if (this.visible) {
      this.errores = this.tipo === 'error' ? this.mensaje.split(/\n|,/) : [];
      this.showClass = 'show';

      // Ocultar automáticamente solo si NO es modo offline
      if (!this.mensaje.includes("No se pudo enviar correo, código generado en modo offline")) {
        setTimeout(() => this.showClass = 'hide', 5000);
      }
    }
  }

  copiarOTP() {
  if (!this.otp) return;

  navigator.clipboard.writeText(this.otp).then(() => {
    alert(`Código OTP copiado: ${this.otp}`);
    // Ocultar la notificación al copiar
    this.visible = false;
  });
}

}
