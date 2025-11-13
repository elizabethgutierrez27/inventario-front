// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://appwebpro-backend.onrender.com/auth';
  private tokenKey = 'token';
  private tiempoKey = 'tiempo_restante_min';

  constructor(private http: HttpClient,private router: Router) {
    if (this.isLocalStorageAvailable()) {
    this.iniciarContadorSesion();
  }
  }

  // LOGIN
  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, password });
  }

  // VERIFICAR CÓDIGO
  verificarCodigo(correo: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-codigo`, { correo, codigo }).pipe(
      tap((res: any) => {
        if (res?.codigo === 0 && res?.tiempo_restante_min !== undefined) {
          this.guardarTiempoRestante(res.tiempo_restante_min);
          if (res?.token) {
            this.guardarToken(res.token);
          }
        }
      })
    );
  }

  // ----------------------
  // TOKEN
  // ----------------------
  guardarToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  obtenerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

  // ----------------------
  // TIEMPO RESTANTE
  // ----------------------
  guardarTiempoRestante(tiempo: number): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.tiempoKey, tiempo.toString());
    }
  }



obtenerTiempoRestante(): number {
  if (typeof window === 'undefined') return 0;
  const t = localStorage.getItem('tiempo_restante_min');
  return t ? parseInt(t, 10) : 0;
}


  decrementarTiempoRestante(): void {
    const tiempo = this.obtenerTiempoRestante();
    if (tiempo > 0) this.guardarTiempoRestante(tiempo - 1);
  }

  // ----------------------
  // LOGOUT
  // ----------------------
  logout(): Observable<any> {
    const token = this.obtenerToken();
    if (!token) {
      this.cerrarSesionLocal();
      return of({ mensaje: "No había token", codigo: 2 });
    }

    const headers = this.obtenerCabecerasAutenticadas();
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap({
        next: () => this.cerrarSesionLocal(),
        error: () => this.cerrarSesionLocal()
      })
    );
  }

  cerrarSesionLocal(): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tiempoKey);
  }

  obtenerCabecerasAutenticadas(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.obtenerToken() || ''}`
    });
  }

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
  private iniciarContadorSesion() {
  interval(60000).subscribe(() => {
    const tiempo = this.obtenerTiempoRestante();

    if (tiempo > 0) {
      this.guardarTiempoRestante(tiempo - 1);
    } else if (tiempo === 0 && this.obtenerToken()) {
      console.log('[AuthService] Sesión expirada, cerrando...');

      this.logout().subscribe({
        next: () => {
          console.log('[AuthService] Logout ejecutado');
          this.router.navigate(['/login']);  // ✅ Redirigir
        },
        error: (err) => {
          console.error('[AuthService] Error en logout:', err);
          this.router.navigate(['/login']);  // ✅ Redirigir aunque falle
        }
      });
    }
  });
}


}
