import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
  GET_VENTAS,
  GET_VENTA_BY_ID,
  GET_VENTAS_PAGINADAS,
  CREATE_VENTA,
  UPDATE_VENTA,
  DELETE_VENTA,
  UPDATE_VENTA_STATUS
} from 'src/app/graphql/graphql/venta.graphql';

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
  cliente?: any;
  vendedor?: any;
  cajero?: any;
  caja?: any;
  factura?: any;
  detalles?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private apollo: Apollo) { }

  // Obtener todas las ventas
  getAll(): Observable<Venta[]> {
    return this.apollo.watchQuery<{ findAllVentas: Venta[] }>({
      query: GET_VENTAS,
      fetchPolicy: 'cache-first'
    }).valueChanges.pipe(
      map(result => result.data.findAllVentas)
    );
  }

  // Obtener venta por ID
  getById(id: number): Observable<Venta> {
    return this.apollo.watchQuery<{ findVentaById: Venta }>({
      query: GET_VENTA_BY_ID,
      variables: { id },
      fetchPolicy: 'cache-first'
    }).valueChanges.pipe(
      map(result => result.data.findVentaById)
    );
  }

  // Obtener ventas paginadas
  getPaginated(page: number, size: number, search: string = ''): Observable<PaginatedResponse<Venta>> {
    return this.apollo.watchQuery<{ findVentasPaginated: PaginatedResponse<Venta> }>({
      query: GET_VENTAS_PAGINADAS,
      variables: { page, size, search },
      fetchPolicy: 'cache-first'
    }).valueChanges.pipe(
      map(result => result.data.findVentasPaginated)
    );
  }

  // Crear venta
  create(venta: any): Observable<Venta> {
    return this.apollo.mutate<{ createVenta: Venta }>({
      mutation: CREATE_VENTA,
      variables: { input: venta },
      refetchQueries: [
        { query: GET_VENTAS_PAGINADAS, variables: { page: 1, size: 5, search: '' } }
      ]
    }).pipe(
      map(result => result.data!.createVenta)
    );
  }

  // Actualizar venta
  update(id: number, venta: any): Observable<Venta> {
    return this.apollo.mutate<{ updateVenta: Venta }>({
      mutation: UPDATE_VENTA,
      variables: { id, input: venta },
      refetchQueries: [
        { query: GET_VENTAS_PAGINADAS, variables: { page: 1, size: 5, search: '' } }
      ]
    }).pipe(
      map(result => result.data!.updateVenta)
    );
  }

  // Eliminar venta
  delete(id: number): Observable<{ id: number }> {
    return this.apollo.mutate<{ deleteVenta: { id: number } }>({
      mutation: DELETE_VENTA,
      variables: { id },
      refetchQueries: [
        { query: GET_VENTAS_PAGINADAS, variables: { page: 1, size: 5, search: '' } }
      ]
    }).pipe(
      map(result => result.data!.deleteVenta)
    );
  }

  // Actualizar estado de venta
  updateStatus(id: number, estado: string): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_VENTA_STATUS,
      variables: { id, estado },
      refetchQueries: [
        { query: GET_VENTAS_PAGINADAS, variables: { page: 1, size: 5, search: '' } }
      ]
    }).pipe(
      map(result => result.data)
    );
  }
}