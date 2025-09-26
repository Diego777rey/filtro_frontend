// categoria-reporte.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CategoriaReporteService {
  private baseUrl = 'http://localhost:8080/api/reportes/categoria';
//aca apuntamos la url del backend para traer el reporte
  constructor(private http: HttpClient) {}

  descargar(descripcion?: string) {
    let params = new HttpParams();
    if (descripcion) params = params.set('descripcion', descripcion);

    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }
}
