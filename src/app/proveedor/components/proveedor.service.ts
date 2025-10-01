import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { InputProveedor } from './input.proveedor';
import { 
  CREATE_PROVEEDOR, DELETE_PROVEEDOR, GET_PROVEEDORES, GET_PROVEEDOR_BY_ID, GET_PROVEEDORES_PAGINADOS, UPDATE_PROVEEDOR 
} from 'src/app/graphql/graphql/proveedor.graphql';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(private apollo: Apollo) { }

  getAll(): Observable<InputProveedor[]> {
    // Usar la query paginada con un tamaño grande para obtener todos los proveedores
    return this.apollo.watchQuery({
      query: GET_PROVEEDORES_PAGINADOS,
      variables: { page: 0, size: 1000, search: '' },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => {
        const proveedores = result.data?.findProveedoresPaginated?.items || [];
        return proveedores.map((proveedor: any) => this.mapGraphQLToInputProveedor(proveedor));
      }),
      catchError((err: any) => {
        console.error('Error en getAll proveedores:', err);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<InputProveedor> {
    return this.apollo.watchQuery({
      query: GET_PROVEEDOR_BY_ID,
      variables: { proveedorId: id }
    }).valueChanges.pipe(
      map((result: any) => this.mapGraphQLToInputProveedor(result.data?.findProveedorById))
    );
  }

  getPaginated(page: number, size: number, search: string = ''): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_PROVEEDORES_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map((result: any) => {
        if (result.errors) console.error('GraphQL errors:', result.errors);
        const data = result.data?.findProveedoresPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
        return {
          ...data,
          items: data.items?.map((proveedor: any) => this.mapGraphQLToInputProveedor(proveedor)) || []
        };
      }),
      catchError((err: any) => throwError(() => err))
    );
  }

  create(proveedor: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_PROVEEDOR,
      variables: { input: proveedor }
    }).pipe(
      map((result: any) => {
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0]?.message || 'Error al crear proveedor');
        }
        return this.mapGraphQLToInputProveedor(result.data.createProveedor);
      }),
      catchError((err: any) => {
        console.error('Error creating proveedor:', err);
        return throwError(() => err);
      })
    );
  }

  update(id: number, proveedor: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_PROVEEDOR,
      variables: { id, input: proveedor }
    }).pipe(
      map((result: any) => {
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0]?.message || 'Error al actualizar proveedor');
        }
        return this.mapGraphQLToInputProveedor(result.data.updateProveedor);
      }),
      catchError((err: any) => {
        console.error('Error updating proveedor:', err);
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_PROVEEDOR,
      variables: { id }
    }).pipe(
      map((result: any) => result.data.deleteProveedor)
    );
  }

  // Método para mapear la respuesta de GraphQL a InputProveedor
  private mapGraphQLToInputProveedor(graphqlProveedor: any): InputProveedor {
    if (!graphqlProveedor) return new InputProveedor();

    return new InputProveedor({
      id: graphqlProveedor.id,
      ruc: graphqlProveedor.ruc,
      razonSocial: graphqlProveedor.razonSocial,
      rubro: graphqlProveedor.rubro,
      telefono: graphqlProveedor.telefono,
      email: graphqlProveedor.email,
      observaciones: graphqlProveedor.observaciones
    });
  }
}
