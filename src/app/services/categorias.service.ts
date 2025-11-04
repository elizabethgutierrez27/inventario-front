import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private baseUrl = 'http://localhost:3001/categorias'; // Ajusta tu URL de backend

  constructor(private http: HttpClient) { }

  // Listar todas las categorías
  listarCategorias(): Observable<{ codigo: number, mensaje: string, categorias: Categoria[] }> {
    return this.http.get<{ codigo: number, mensaje: string, categorias: Categoria[] }>(`${this.baseUrl}/listar`);
  }

  // Buscar categoría por nombre
  buscarPorNombre(nombre: string): Observable<{ codigo: number, mensaje: string, categoria: Categoria }> {
    return this.http.post<{ codigo: number, mensaje: string, categoria: Categoria }>(`${this.baseUrl}/buscar`, { nombre });
  }
}
