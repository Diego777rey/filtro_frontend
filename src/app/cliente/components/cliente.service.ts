import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, throwError, timer } from 'rxjs';
import { map, retry, catchError, retryWhen, delay, take } from 'rxjs/operators';
import { Cliente } from './cliente';
import { Persona } from '../../Personas/components/persona';
import { CREATE_CLIENTE, DELETE_CLIENTE, UPDATE_CLIENTE, GET_CLIENTES_PAGINADOS, GET_CLIENTE_BY_ID } from 'src/app/graphql/cliente.graphql';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  constructor(private apollo: Apollo) {}

  getClientes(): Observable<Cliente[]> {
    return this.apollo.watchQuery<{ findClientesPaginated: { items: Cliente[] } }>({
      query: GET_CLIENTES_PAGINADOS,
      variables: { page: 0, size: 1000, search: '' },
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true
    }).valueChanges.pipe(
      retryWhen(errors => 
        errors.pipe(
          delay(1000),
          take(3)
        )
      ),
      map(result => {
        if (result.errors && result.errors.length > 0) {
          console.error('Errores GraphQL:', result.errors);
          throw new Error(result.errors[0].message);
        }
        return result.data?.findClientesPaginated?.items || [];
      }),
      catchError(error => {
        console.error('Error en ClienteService:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<Cliente> {
    return this.apollo.watchQuery<{ findClienteById: Cliente }>({
      query: GET_CLIENTE_BY_ID,
      variables: { id },
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map(result => result.data?.findClienteById)
    );
  }

  createCliente(cliente: Cliente): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_CLIENTE,
      variables: { input: cliente }
    });
  }

  updateCliente(id: number, cliente: Cliente): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_CLIENTE,
      variables: { id, input: cliente }
    });
  }

  deleteCliente(id: number): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_CLIENTE,
      variables: { id }
    });
  }

  getPaginated(page: number, size: number, search: string = ''): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_CLIENTES_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map((result: any) => {
        return result.data?.findClientesPaginated || { 
          items: [], 
          totalItems: 0, 
          totalPages: 0, 
          currentPage: 0 
        };
      })
    );
  }

  // Método auxiliar para crear un cliente con estructura anidada
  createClienteWithPersona(clienteData: any): Observable<any> {
    const input = {
      codigoCliente: clienteData.codigoCliente,
      fechaRegistro: clienteData.fechaRegistro || new Date().toISOString(),
      personaId: clienteData.personaId
    };
    
    return this.apollo.mutate({
      mutation: CREATE_CLIENTE,
      variables: { input }
    });
  }

  // Método auxiliar para actualizar un cliente con estructura anidada
  updateClienteWithPersona(id: number, clienteData: any): Observable<any> {
    const input = {
      codigoCliente: clienteData.codigoCliente,
      fechaRegistro: clienteData.fechaRegistro,
      personaId: clienteData.personaId
    };
    
    return this.apollo.mutate({
      mutation: UPDATE_CLIENTE,
      variables: { id, input }
    });
  }
}
