import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from '../../core/services/base-crud.service';
import { gql } from 'apollo-angular';
import { MovimientoCaja, MovimientoCajaPaginatedResponse, Venta } from './movimiento-caja';
import { 
  GET_MOVIMIENTOS_CAJA, 
  GET_MOVIMIENTO_CAJA_BY_ID, 
  GET_MOVIMIENTOS_CAJA_PAGINADOS, 
  CREATE_MOVIMIENTO_CAJA, 
  UPDATE_MOVIMIENTO_CAJA, 
  DELETE_MOVIMIENTO_CAJA,
  ACEPTAR_VENTA,
  CANCELAR_VENTA,
  GET_VENTAS_PENDIENTES
} from 'src/app/graphql/MovimientoCaja.graphql';

@Injectable({
  providedIn: 'root'
})
export class MovimientoCajaService extends BaseCrudService {

  // Obtener todos los movimientos de caja
  getAll(): Observable<MovimientoCaja[]> {
    return this.executeQuery<MovimientoCaja[]>(GET_MOVIMIENTOS_CAJA);
  }

  // Obtener movimiento de caja por ID
  getById(id: string): Observable<MovimientoCaja> {
    return this.executeQuery<MovimientoCaja>(GET_MOVIMIENTO_CAJA_BY_ID, { id });
  }

  // Obtener movimientos paginados
  getPaginated(page: number, size: number, search?: string): Observable<MovimientoCajaPaginatedResponse> {
    return this.executePaginatedQuery<MovimientoCajaPaginatedResponse>(
      GET_MOVIMIENTOS_CAJA_PAGINADOS, 
      page, 
      size, 
      search
    );
  }

  // Crear movimiento de caja
  create(movimiento: Partial<MovimientoCaja>): Observable<MovimientoCaja> {
    return this.executeMutation<MovimientoCaja>(CREATE_MOVIMIENTO_CAJA, { input: movimiento });
  }

  // Actualizar movimiento de caja
  update(id: string, movimiento: Partial<MovimientoCaja>): Observable<MovimientoCaja> {
    return this.executeMutation<MovimientoCaja>(UPDATE_MOVIMIENTO_CAJA, { id, input: movimiento });
  }

  // Eliminar movimiento de caja
  delete(id: string): Observable<{ id: number }> {
    return this.executeMutation<{ id: number }>(DELETE_MOVIMIENTO_CAJA, { id });
  }

  // Aceptar venta (crear movimiento de caja)
  aceptarVenta(ventaId: string): Observable<MovimientoCaja> {
    return this.executeMutation<MovimientoCaja>(ACEPTAR_VENTA, { ventaId });
  }

  // Cancelar venta
  cancelarVenta(ventaId: string): Observable<{ id: number; total: number; estado: string }> {
    return this.executeMutation<{ id: number; total: number; estado: string }>(CANCELAR_VENTA, { ventaId });
  }

  // Obtener ventas pendientes por caja
  getVentasPendientes(cajaId: string): Observable<Venta[]> {
    return this.executeQuery<Venta[]>(GET_VENTAS_PENDIENTES).pipe(
      map((ventas: Venta[]) => {
        // Filtrar ventas de la caja específica (sin filtro de estado por ahora)
        return ventas.filter(venta => 
          venta.caja?.id?.toString() === cajaId
        );
      })
    );
  }

  // Obtener resumen de caja (saldo actual, ventas del día, etc.)
  getResumenCaja(cajaId: string): Observable<{
    saldoActual: number;
    ventasAprobadas: number;
    ventasPendientes: number;
    ventasCanceladas: number;
    totalVentas: number;
    fechaApertura: string;
  }> {
    const GET_RESUMEN_CAJA = gql`
      query GetResumenCaja($cajaId: ID!) {
        getResumenCaja(cajaId: $cajaId) {
          saldoActual
          ventasAprobadas
          ventasPendientes
          ventasCanceladas
          totalVentas
          fechaApertura
        }
      }
    `;
    
    return this.executeQuery<{
      saldoActual: number;
      ventasAprobadas: number;
      ventasPendientes: number;
      ventasCanceladas: number;
      totalVentas: number;
      fechaApertura: string;
    }>(GET_RESUMEN_CAJA, { cajaId });
  }

  // Obtener historial de movimientos de caja por fecha
  getMovimientosPorFecha(cajaId: string, fecha: string): Observable<MovimientoCaja[]> {
    const GET_MOVIMIENTOS_POR_FECHA = gql`
      query GetMovimientosPorFecha($cajaId: ID!, $fecha: String!) {
        getMovimientosPorFecha(cajaId: $cajaId, fecha: $fecha) {
          id
          monto
          tipo
          fecha
          descripcion
          venta {
            id
            total
            estado
            cliente {
              id
              nombre
              apellido
            }
          }
        }
      }
    `;
    
    return this.executeQuery<MovimientoCaja[]>(GET_MOVIMIENTOS_POR_FECHA, { cajaId, fecha });
  }

}
