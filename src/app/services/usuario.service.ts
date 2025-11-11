import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'https://appwebpro-backend.onrender.com'; // Base de la API

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/nuevo`, data);
  }

  eliminarUsuario(data: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/eliminar`, { body: data });
  }

  actualizarUsuario(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/actualizar`, data);
  }
}
