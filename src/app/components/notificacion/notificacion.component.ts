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
      </ng-container>
    </div>
  `,
  styleUrls: ['./notificacion.component.css']
})
export class NotificacionComponent implements OnChanges {
  @Input() visible = false;
  @Input() mensaje = '';
  @Input() tipo: 'success' | 'error' = 'success';

  errores: string[] = [];
  showClass = 'show';

  ngOnChanges() {
    if (this.visible) {
      // Separar los errores por salto de línea o coma
      this.errores = this.tipo === 'error' ? this.mensaje.split(/\n|,/) : [];
      this.showClass = 'show';
      // Ocultar automáticamente después de 5 segundos
      setTimeout(() => this.showClass = 'hide', 5000);
    }
  }
}
