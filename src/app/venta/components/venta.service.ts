import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../core/services/base-crud.service';
import { gql } from 'apollo-angular';
import {
  GET_VENTAS,
  GET_VENTA_BY_ID,
  GET_VENTAS_PAGINADAS,
  CREATE_VENTA,
  UPDATE_VENTA,
  DELETE_VENTA,
  UPDATE_VENTA_STATUS
} from 'src/app/graphql/venta.graphql';

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

export interface Venta {
  id?: number;
  codigoVenta?: string;
  fechaVenta?: string;
  total?: number;
  tipoVenta?: string;
  estadoVenta?: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'FACTURADA' | 'ENTREGADA';
  cliente?: {
    id: number;
    codigoCliente?: string;
    persona?: {
      id: number;
      nombre: string;
      apellido: string;
      documento?: string;
      telefono?: string;
      email?: string;
    };
  };
  vendedor?: {
    id: number;
    nombre: string;
  };
  cajero?: {
    id: number;
    codigoCajero?: string;
  };
  caja?: {
    id: number;
    codigoCaja?: string;
    estadoCaja?: string;
  };
  detalles?: VentaDetalle[];
  fechaAprobacion?: string;
  fechaCancelacion?: string;
  motivoCancelacion?: string;
}

export interface VentaDetalle {
  id?: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  subtotal: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
  };
}

export interface VentaInput {
  clienteId: string;
  vendedorId: string;
  cajeroId: string;
  cajaId: string;
  tipoVenta: string;
  detalles: VentaDetalleInput[];
}

export interface VentaDetalleInput {
  productoId: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class VentaService extends BaseCrudService {

  // Obtener todas las ventas
  getAll(): Observable<Venta[]> {
    return this.executeQuery<Venta[]>(GET_VENTAS);
  }

  // Obtener venta por ID
  getById(id: string): Observable<Venta> {
    return this.executeQuery<Venta>(GET_VENTA_BY_ID, { id });
  }

  // Obtener ventas paginadas
  getPaginated(page: number, size: number, search?: string): Observable<PaginatedResponse<Venta>> {
    return this.executePaginatedQuery<PaginatedResponse<Venta>>(
      GET_VENTAS_PAGINADAS, 
      page, 
      size, 
      search
    );
  }

  // Crear venta
  create(venta: VentaInput): Observable<Venta> {
    return this.executeMutation<Venta>(CREATE_VENTA, { input: venta });
  }

  // Actualizar venta
  update(id: string, venta: VentaInput): Observable<Venta> {
    return this.executeMutation<Venta>(UPDATE_VENTA, { id, input: venta });
  }

  // Eliminar venta
  delete(id: string): Observable<Venta> {
    return this.executeMutation<Venta>(DELETE_VENTA, { id });
  }

  // Actualizar estado de venta
  updateStatus(id: string, estado: string): Observable<any> {
    return this.executeMutation<any>(UPDATE_VENTA_STATUS, { id, estado });
  }

  // Aprobar venta (cajero aprueba la venta)
  aprobarVenta(ventaId: string, cajeroId: string): Observable<Venta> {
    const APROBAR_VENTA = gql`
      mutation AprobarVenta($ventaId: ID!, $cajeroId: ID!) {
        aprobarVenta(ventaId: $ventaId, cajeroId: $cajeroId) {
          id
          codigoVenta
          estadoVenta
          fechaAprobacion
          cajero {
            id
            codigoCajero
          }
        }
      }
    `;
    
    return this.executeMutation<Venta>(APROBAR_VENTA, { ventaId, cajeroId });
  }

  // Cancelar venta (cajero cancela la venta)
  cancelarVenta(ventaId: string, motivo: string): Observable<Venta> {
    const CANCELAR_VENTA = gql`
      mutation CancelarVenta($ventaId: ID!, $motivo: String!) {
        cancelarVenta(ventaId: $ventaId, motivo: $motivo) {
          id
          codigoVenta
          estadoVenta
          fechaCancelacion
          motivoCancelacion
        }
      }
    `;
    
    return this.executeMutation<Venta>(CANCELAR_VENTA, { ventaId, motivo });
  }

  // Obtener ventas pendientes por caja
  getVentasPendientesPorCaja(cajaId: string): Observable<Venta[]> {
    const GET_VENTAS_PENDIENTES_POR_CAJA = gql`
      query GetVentasPendientesPorCaja($cajaId: ID!) {
        getVentasPendientesPorCaja(cajaId: $cajaId) {
          id
          codigoVenta
          fechaVenta
          total
          estadoVenta
          cliente {
            id
            codigoCliente
            persona {
              nombre
              apellido
            }
          }
          vendedor {
            id
            nombre
          }
          detalles {
            id
            cantidad
            precioUnitario
            subtotal
            producto {
              id
              nombre
            }
          }
        }
      }
    `;
    
    return this.executeQuery<Venta[]>(GET_VENTAS_PENDIENTES_POR_CAJA, { cajaId });
  }

  // Crear venta pendiente (vendedor crea la venta, queda pendiente de aprobación)
  crearVentaPendiente(venta: VentaInput): Observable<Venta> {
    const CREAR_VENTA_PENDIENTE = gql`
      mutation CrearVentaPendiente($input: VentaInput!) {
        crearVentaPendiente(input: $input) {
          id
          codigoVenta
          fechaVenta
          total
          estadoVenta
          cliente {
            id
            codigoCliente
            persona {
              nombre
              apellido
            }
          }
          vendedor {
            id
            nombre
          }
          caja {
            id
            codigoCaja
            estadoCaja
          }
        }
      }
    `;
    
    return this.executeMutation<Venta>(CREAR_VENTA_PENDIENTE, { input: venta });
  }
}