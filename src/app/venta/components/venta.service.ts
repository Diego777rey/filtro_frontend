import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../core/services/base-crud.service';
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
  estadoVenta?: string;
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
  };
  factura?: {
    id: number;
    numero?: string;
  };
  detalles?: VentaDetalle[];
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
  delete(id: string): Observable<boolean> {
    return this.executeMutation<boolean>(DELETE_VENTA, { id });
  }

  // Actualizar estado de venta
  updateStatus(id: string, estado: string): Observable<any> {
    return this.executeMutation<any>(UPDATE_VENTA_STATUS, { id, estado });
  }
}