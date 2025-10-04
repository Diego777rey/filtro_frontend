// src/app/services/cajero.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Cajero } from './cajero';
import { Persona } from '../../Personas/components/persona';
import { map, Observable } from 'rxjs';
import { CREATE_CAJERO, DELETE_CAJERO, GET_CAJEROS, UPDATE_CAJERO, GET_CAJEROS_PAGINADOS, GET_CAJERO_BY_ID } from 'src/app/graphql/cajero.graphql';
@Injectable({
  providedIn: 'root'
})
export class CajeroService {
  constructor(private apollo: Apollo) {}

  getAll() {
    return this.apollo.watchQuery<{ findAllCajeros: Cajero[] }>({
      query: GET_CAJEROS
    }).valueChanges.pipe(map(result => result.data.findAllCajeros));//este es lo que devuelve el servicio graphql
  }

  getById(id: number) {
    return this.apollo.watchQuery<{ findCajeroById: Cajero }>({
      query: GET_CAJERO_BY_ID,
      variables: { id }
    }).valueChanges.pipe(map(result => result.data.findCajeroById));
  }

  create(cajero: Cajero) {
    return this.apollo.mutate({
      mutation: CREATE_CAJERO,
      variables: { input: cajero }
    });
  }

  update(id: number, cajero: Cajero) {
    return this.apollo.mutate({
      mutation: UPDATE_CAJERO,
      variables: { id, input: cajero }
    });
  }

  delete(id: number) {
    return this.apollo.mutate({
      mutation: DELETE_CAJERO,
      variables: { id }
    });
  }

  getPaginated(page: number, size: number, search: string = ''): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_CAJEROS_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map((result: any) => {
        return result.data?.findCajerosPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
      })
    );
  }

  // Método auxiliar para crear un cajero con estructura anidada
  createCajeroWithPersona(cajeroData: any): Observable<any> {
    const input = {
      codigoCajero: cajeroData.codigoCajero,
      turno: cajeroData.turno,
      fechaIngreso: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      estado: 'ACTIVO', // Estado por defecto
      cajaId: '1', // ID de caja por defecto - deberías obtenerlo de algún lugar
      personaId: cajeroData.persona.id
    };
    
    // Log removido para modo de producción
    
    return this.apollo.mutate({
      mutation: CREATE_CAJERO,
      variables: { input }
    });
  }

  // Método auxiliar para actualizar un cajero con estructura anidada
  updateCajeroWithPersona(id: number, cajeroData: any): Observable<any> {
    const input = {
      codigoCajero: cajeroData.codigoCajero,
      turno: cajeroData.turno,
      fechaIngreso: cajeroData.fechaIngreso || new Date().toISOString().split('T')[0],
      estado: cajeroData.estado || 'ACTIVO',
      cajaId: cajeroData.cajaId || '1',
      personaId: cajeroData.persona.id
    };
    
    return this.apollo.mutate({
      mutation: UPDATE_CAJERO,
      variables: { id, input }
    });
  }
}
