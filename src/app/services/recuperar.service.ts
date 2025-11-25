import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SolicitarResetResponse {
  mensaje: string;
  codigo?: number;
  otp?: string;
}

interface ResetConCodigoResponse {
  mensaje: string;
  codigo: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecuperarService {

  private apiUrl = 'https://appwebpro-backend.onrender.com/recuperar';

  constructor(private http: HttpClient) { }

  // Solicitar código de recuperación
  solicitarReset(correo: string): Observable<SolicitarResetResponse> {
    return this.http.post<SolicitarResetResponse>(
      `${this.apiUrl}/solicitar-reset`,
      { correo }
    );
  }

  // Restablecer contraseña con código
  resetConCodigo(correo: string, codigo: string, nuevaPassword: string): Observable<ResetConCodigoResponse> {
    return this.http.post<ResetConCodigoResponse>(
      `${this.apiUrl}/reset-con-codigo`,
      { correo, codigo, nuevaPassword }
    );
  }
}
