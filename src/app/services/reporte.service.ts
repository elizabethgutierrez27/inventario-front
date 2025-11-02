import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:3001/reporte'; // tu endpoint de Java con Swagger

  constructor(private http: HttpClient) { }

  getInventarioActual(): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario`, {});
  }

  getMasVendidos(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mas-vendidos`, {});
  }

  getBajoStock(): Observable<any> {
    return this.http.post(`${this.apiUrl}/bajo-stock`, {});
  }

  getMovimientosPeriodo(): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimientos-periodo`, {});
  }

  getDashboardValorInventario(): Observable<any> {
    return this.http.post(`${this.apiUrl}/dashboard/valor-inventario`, {});
  }

  getDashboardMasVendidos(): Observable<any> {
    return this.http.post(`${this.apiUrl}/dashboard/mas-vendidos`, {});
  }

  exportReport(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, body, { responseType: 'blob' });
  }
  
}
