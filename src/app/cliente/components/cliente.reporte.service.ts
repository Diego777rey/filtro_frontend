// clientes-reporte.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClienteReporteService {
  private baseUrl = 'http://localhost:8080/api/reportes/cliente';

  constructor(private http: HttpClient) {}

  descargar(nombre?: string, fechaInicio?: string, fechaFin?: string) {
    let params = new HttpParams();
    if (nombre) params = params.set('nombre', nombre);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }
}
