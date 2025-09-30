import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Depositero, DepositeroPaginatedResponse } from './depositero';
import { 
  GET_DEPOSITEROS, 
  GET_DEPOSITERO_BY_ID, 
  GET_DEPOSITEROS_PAGINADOS, 
  CREATE_DEPOSITERO, 
  UPDATE_DEPOSITERO, 
  DELETE_DEPOSITERO 
} from 'src/app/graphql/graphql/depositero.graphql';

@Injectable({
  providedIn: 'root'
})
export class DepositeroService {

  constructor(private apollo: Apollo) { }

  // Obtener todos los depositeros
  getAll(): Observable<Depositero[]> {
    return this.apollo.watchQuery<{ findAllDepositeros: Depositero[] }>({
      query: GET_DEPOSITEROS
    }).valueChanges.pipe(
      map(result => result.data.findAllDepositeros)
    );
  }

  // Obtener depositero por ID
  getById(id: string): Observable<Depositero> {
    return this.apollo.watchQuery<{ findDepositeroById: Depositero }>({
      query: GET_DEPOSITERO_BY_ID,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.findDepositeroById)
    );
  }

  // Obtener depositeros paginados
  getPaginated(page: number, size: number, search?: string): Observable<DepositeroPaginatedResponse> {
    return this.apollo.watchQuery<{ findDepositerosPaginated: DepositeroPaginatedResponse }>({
      query: GET_DEPOSITEROS_PAGINADOS,
      variables: { page, size, search: search || '' },
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map(result => result.data?.findDepositerosPaginated || { 
        items: [], 
        totalItems: 0, 
        totalPages: 0, 
        currentPage: 0 
      })
    );
  }

  // Crear depositero
  create(depositero: Partial<Depositero>): Observable<Depositero> {
    return this.apollo.mutate<{ createDepositero: Depositero }>({
      mutation: CREATE_DEPOSITERO,
      variables: { input: depositero }
    }).pipe(
      map(result => result.data!.createDepositero)
    );
  }

  // Actualizar depositero
  update(id: string, depositero: Partial<Depositero>): Observable<Depositero> {
    return this.apollo.mutate<{ updateDepositero: Depositero }>({
      mutation: UPDATE_DEPOSITERO,
      variables: { id, input: depositero }
    }).pipe(
      map(result => result.data!.updateDepositero)
    );
  }

  // Método auxiliar para crear un depositero con estructura anidada
  createDepositeroWithPersona(depositeroData: any): Observable<any> {
    const input = {
      codigoDepositero: depositeroData.codigoDepositero,
      fechaIngreso: depositeroData.fechaIngreso,
      turno: depositeroData.turno,
      almacenAsignado: depositeroData.almacenAsignado,
      supervisor: depositeroData.supervisor,
      horario: depositeroData.horario,
      estado: depositeroData.estado,
      personaId: depositeroData.personaId
    };
    
    return this.apollo.mutate({
      mutation: CREATE_DEPOSITERO,
      variables: { input }
    });
  }

  // Método auxiliar para actualizar un depositero con estructura anidada
  updateDepositeroWithPersona(id: string, depositeroData: any): Observable<any> {
    const input = {
      codigoDepositero: depositeroData.codigoDepositero,
      fechaIngreso: depositeroData.fechaIngreso,
      turno: depositeroData.turno,
      almacenAsignado: depositeroData.almacenAsignado,
      supervisor: depositeroData.supervisor,
      horario: depositeroData.horario,
      estado: depositeroData.estado,
      personaId: depositeroData.personaId
    };
    
    return this.apollo.mutate({
      mutation: UPDATE_DEPOSITERO,
      variables: { id, input }
    });
  }

  // Eliminar depositero
  delete(id: string): Observable<{ id: string }> {
    return this.apollo.mutate<{ deleteDepositero: { id: string } }>({
      mutation: DELETE_DEPOSITERO,
      variables: { id }
    }).pipe(
      map(result => result.data!.deleteDepositero)
    );
  }
}
