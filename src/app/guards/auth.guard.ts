import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = authService.obtenerToken();

  if (!token) {
    console.warn('[AuthGuard] No hay token. Acceso denegado.');
    router.navigate(['/login']);
    return false;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    const rol = payload.rol;

    if (state.url.startsWith('/admin') && rol !== 'admin') {
      console.warn('[AuthGuard] No autorizado para /admin');
      router.navigate(['/login']);
      return false;
    }

    if (state.url.startsWith('/personal') && rol !== 'user') {
      console.warn('[AuthGuard] No autorizado para /personal');
      router.navigate(['/login']);
      return false;
    }


    return true;
  } catch (error) {
    console.error('[AuthGuard] Token inválido', error);
    router.navigate(['/login']);
    return false;
  }
};
