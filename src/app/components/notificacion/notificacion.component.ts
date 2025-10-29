import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notificacion',
  template: `
    <div *ngIf="visible" class="notificacion" [class.success]="tipo==='success'" [class.error]="tipo==='error'">
      {{ mensaje }}
      <button (click)="visible=false">✕</button>
    </div>
  `,
  styleUrls: ['./notificacion.component.css']
})
export class NotificacionComponent {
  @Input() visible = false;
  @Input() mensaje = '';
  @Input() tipo = 'success';
}
