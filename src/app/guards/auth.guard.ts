import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('[AuthGuard] No se puede acceder a localStorage.');
    router.navigate(['/login']); // <--- Redirige al login
    return false;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('[AuthGuard] No hay token. Acceso denegado.');
    router.navigate(['/login']); // <--- Redirige al login
    return false;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    const rol = payload.rol;

    if (state.url.startsWith('/admin') && rol !== 'admin') {
      console.warn('[AuthGuard] No autorizado para /admin');
      router.navigate(['/login']); // <--- Redirige si no tiene rol
      return false;
    }

    if (state.url.startsWith('/personal') && rol !== 'personal') {
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
