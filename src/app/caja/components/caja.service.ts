import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';
import { 
  GET_CAJAS, 
  GET_CAJA_BY_ID, 
  GET_CAJAS_PAGINADAS, 
  CREATE_CAJA, 
  UPDATE_CAJA, 
  DELETE_CAJA 
} from 'src/app/graphql/caja.graphql';
import { Caja } from './caja';

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  constructor(private apollo: Apollo) { }

  // Obtener todas las cajas
  getAll(): Observable<Caja[]> {
    return this.apollo.watchQuery<{ findAllCajas: Caja[] }>({
      query: GET_CAJAS
    }).valueChanges.pipe(
      map(result => result.data.findAllCajas)
    );
  }

  // Obtener caja por ID
  getById(id: number): Observable<Caja> {
    return this.apollo.watchQuery<{ findCajaById: Caja }>({
      query: GET_CAJA_BY_ID,
      variables: { cajaId: id }
    }).valueChanges.pipe(
      map(result => result.data.findCajaById)
    );
  }

  // Obtener cajas paginadas
  getPaginated(page: number, size: number, search: string = ''): Observable<PaginatedResponse<Caja>> {
    return this.apollo.watchQuery<{ findCajasPaginated: PaginatedResponse<Caja> }>({
      query: GET_CAJAS_PAGINADAS,
      variables: { page, size, search }
    }).valueChanges.pipe(
      map(result => result.data.findCajasPaginated)
    );
  }

  // Crear caja
  create(caja: Caja): Observable<Caja> {
    return this.apollo.mutate<{ saveCaja: Caja }>({
      mutation: CREATE_CAJA,
      variables: { input: caja }
    }).pipe(
      map(result => result.data!.saveCaja)
    );
  }

  // Actualizar caja
  update(id: number, caja: Caja): Observable<Caja> {
    return this.apollo.mutate<{ updateCaja: Caja }>({
      mutation: UPDATE_CAJA,
      variables: { id, input: caja }
    }).pipe(
      map(result => result.data!.updateCaja)
    );
  }

  // Eliminar caja
  delete(id: number): Observable<{ id: number }> {
    return this.apollo.mutate<{ deleteCaja: { id: number } }>({
      mutation: DELETE_CAJA,
      variables: { id }
    }).pipe(
      map(result => result.data!.deleteCaja)
    );
  }

  // Abrir caja
  abrirCaja(cajaId: number, cajeroId: number, saldoInicial: number): Observable<Caja> {
    const ABRIR_CAJA = gql`
      mutation AbrirCaja($cajaId: ID!, $cajeroId: ID!, $saldoInicial: Float!) {
        abrirCaja(cajaId: $cajaId, cajeroId: $cajeroId, saldoInicial: $saldoInicial) {
          id
          codigoCaja
          estadoCaja
          saldoActual
          fechaApertura
          cajeroActual {
            id
            codigoCajero
            persona {
              nombre
              apellido
            }
          }
        }
      }
    `;
    
    return this.apollo.mutate<{ abrirCaja: Caja }>({
      mutation: ABRIR_CAJA,
      variables: { cajaId, cajeroId, saldoInicial }
    }).pipe(
      map(result => result.data!.abrirCaja)
    );
  }

  // Cerrar caja
  cerrarCaja(cajaId: number, saldoFinal: number): Observable<Caja> {
    const CERRAR_CAJA = gql`
      mutation CerrarCaja($cajaId: ID!, $saldoFinal: Float!) {
        cerrarCaja(cajaId: $cajaId, saldoFinal: $saldoFinal) {
          id
          codigoCaja
          estadoCaja
          saldoActual
          fechaCierre
          saldoCierre
        }
      }
    `;
    
    return this.apollo.mutate<{ cerrarCaja: Caja }>({
      mutation: CERRAR_CAJA,
      variables: { cajaId, saldoFinal }
    }).pipe(
      map(result => result.data!.cerrarCaja)
    );
  }

  // Obtener cajas abiertas por cajero
  getCajasAbiertasPorCajero(cajeroId: number): Observable<Caja[]> {
    const GET_CAJAS_ABIERTAS_POR_CAJERO = gql`
      query GetCajasAbiertasPorCajero($cajeroId: ID!) {
        getCajasAbiertasPorCajero(cajeroId: $cajeroId) {
          id
          codigoCaja
          descripcion
          estadoCaja
          saldoActual
          fechaApertura
        }
      }
    `;
    
    return this.apollo.watchQuery<{ getCajasAbiertasPorCajero: Caja[] }>({
      query: GET_CAJAS_ABIERTAS_POR_CAJERO,
      variables: { cajeroId }
    }).valueChanges.pipe(
      map(result => result.data.getCajasAbiertasPorCajero)
    );
  }
}
