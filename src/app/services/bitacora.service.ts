import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Movimiento {
  id?: number;
  codigo_producto: string;
  tipo_movimiento: string;
  cantidad: number;
  descripcion: string;
  fecha?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BitacoraService {
  private readonly baseURL = 'https://localhost:3000/bitacora';

  constructor(private readonly http: HttpClient) {}

  // Crear nuevo movimiento
  crearMovimiento(movimiento: Movimiento): Observable<any> {
    return this.http.post(`${this.baseURL}/crear`, movimiento);
  }

  // Listar todos los movimientos
  listarMovimientos(): Observable<any> {
    return this.http.get(`${this.baseURL}/listar`);
  }

  // Actualizar movimiento
  actualizarMovimiento(movimiento: {
    id: number;
    tipo_movimiento: string;
    cantidad: number;
    descripcion: string;
  }): Observable<any> {
    return this.http.put(`${this.baseURL}/actualizar`, movimiento);
  }

  // Eliminar movimiento
  eliminarMovimiento(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/eliminar`, { body: { id } });
  }

  // Filtrar movimientos (opcional - si tu backend soporta filtros)
  filtrarMovimientos(filtros: any): Observable<any> {
    return this.http.post(`${this.baseURL}/filtrar`, filtros);
  }
}
