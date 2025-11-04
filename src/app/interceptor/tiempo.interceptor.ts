import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TiempoInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const tiempo = event.body?.tiempo_restante_min;
          if (tiempo !== undefined) {
            // Actualizamos el tiempo restante exacto desde el backend
            this.authService.guardarTiempoRestante(tiempo);
          }
        }
      })
    );
  }

}
