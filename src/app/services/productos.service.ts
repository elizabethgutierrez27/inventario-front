import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Producto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  stock?: number;
  precio: number;
  proveedor?: string;
  id_categoria: number;
  categoria_nombre?: string;
  imagen?: string;
  fecha_ingreso?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl = 'https://appwebpro-backend.onrender.com';

  constructor(private http: HttpClient) {}

  listarProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/listar`);
  }

  filtrarProductos(filtros: { nombre?: string; categoria?: string; proveedor?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos/filtrar`, filtros);
  }

  crearProducto(producto: Producto): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos/crear`, producto);
  }

  actualizarProducto(producto: Producto): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/actualizar`, producto);
  }

  eliminarProducto(codigo: string): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/productos/eliminar`, { body: { codigo } });
  }
}
