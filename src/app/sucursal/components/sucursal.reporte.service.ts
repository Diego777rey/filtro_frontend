// sucursal-reporte.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SucursalReporteService {
  private baseUrl = 'http://localhost:8080/api/reportes/sucursal';
//aca apuntamos la url del backend para traer el reporte
  constructor(private http: HttpClient) {}

  descargar(nombre?: string) {
    let params = new HttpParams();
    if (nombre) params = params.set('nombre', nombre);

    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }
}
