import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq = req;

    if (this.isBrowser()) { // ✅ solo en navegador
      const token = localStorage.getItem('token');
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
      }
    }

    return next.handle(authReq);
  }
}
