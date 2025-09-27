import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cliente, Persona } from './cliente';
import { CREATE_CLIENTE, DELETE_CLIENTE, GET_CLIENTES, UPDATE_CLIENTE, GET_CLIENTES_PAGINADOS, GET_CLIENTE_BY_ID } from 'src/app/graphql/graphql/cliente.graphql';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  constructor(private apollo: Apollo) {}

  getClientes(): Observable<Cliente[]> {
    return this.apollo.watchQuery<{ findAllClientes: Cliente[] }>({
      query: GET_CLIENTES,
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map(result => result.data?.findAllClientes || [])
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
      persona: {
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        documento: clienteData.documento,
        telefono: clienteData.telefono,
        email: clienteData.email,
        direccion: clienteData.direccion,
        estadoPersona: clienteData.estadoPersona || 'ACTIVO',
        fechaNacimiento: clienteData.fechaNacimiento,
        roles: clienteData.roles || [{ tipoPersona: 'CLIENTE' }]
      }
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
      persona: {
        id: clienteData.persona?.id,
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        documento: clienteData.documento,
        telefono: clienteData.telefono,
        email: clienteData.email,
        direccion: clienteData.direccion,
        estadoPersona: clienteData.estadoPersona,
        fechaNacimiento: clienteData.fechaNacimiento,
        roles: clienteData.roles
      }
    };
    
    return this.apollo.mutate({
      mutation: UPDATE_CLIENTE,
      variables: { id, input }
    });
  }
}
