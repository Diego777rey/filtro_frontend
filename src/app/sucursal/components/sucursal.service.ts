import { Sucursal } from "./sucursal";
import { Injectable } from "@angular/core";
import { map, catchError, tap } from "rxjs";
import { Apollo } from "apollo-angular";
import { CREATE_SUCURSAL, DELETE_SUCURSAL, GET_SUCURSALES, UPDATE_SUCURSAL, GET_SUCURSALES_PAGINADOS, GET_SUCURSAL_BY_ID } from "src/app/graphql/sucursal.graphql";
import { of, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  constructor(private apollo: Apollo) {}

  getAll() {
    return this.apollo.watchQuery<{ findAllSucursales: Sucursal[] }>({
      query: GET_SUCURSALES,
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    }).valueChanges.pipe(
      map(result => {
        if (result.errors && result.errors.length > 0) {
          console.error('Errores GraphQL:', result.errors);
        }
        
        const sucursales = result.data?.findAllSucursales || [];
        
        // Procesar sucursales para manejar campos nulos
        return sucursales.map((sucursal: any) => ({
          ...sucursal,
          pais: sucursal.pais || '',
          departamento: sucursal.departamento || '',
          ciudad: sucursal.ciudad || ''
        }));
      }),
      catchError((error) => {
        console.error('Error al cargar sucursales:', error);
        return of([]); // Retornar array vacío en lugar de throwError
      })
    );
  }

  getById(id: number) {
    return this.apollo.watchQuery<{ findSucursalById: Sucursal }>({
      query: GET_SUCURSAL_BY_ID,
      variables: { id }
    }).valueChanges.pipe(
      map(result => {
        const sucursal = result.data.findSucursalById;
        if (sucursal) {
          return {
            ...sucursal,
            pais: sucursal.pais || '',
            departamento: sucursal.departamento || '',
            ciudad: sucursal.ciudad || ''
          };
        }
        return sucursal;
      })
    );
  }

  create(sucursal: Sucursal) {
    return this.apollo.mutate({
      mutation: CREATE_SUCURSAL,
      variables: { input: sucursal }
    }).pipe(
      map((result: any) => result.data?.createSucursal),
      catchError((error) => {
        console.error('Error al crear sucursal:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: number, sucursal: Sucursal) {
    return this.apollo.mutate({
      mutation: UPDATE_SUCURSAL,
      variables: { id, input: sucursal }
    }).pipe(
      map((result: any) => result.data?.updateSucursal),
      catchError((error) => {
        console.error('Error al actualizar sucursal:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: number) {
    return this.apollo.mutate({
      mutation: DELETE_SUCURSAL,
      variables: { id }
    }).pipe(
      map((result: any) => result.data?.deleteSucursal),
      catchError((error) => {
        console.error('Error al eliminar sucursal:', error);
        return throwError(() => error);
      })
    );
  }

  getPaginated(page: number, size: number, search: string = '') {
    return this.apollo.watchQuery({
      query: GET_SUCURSALES_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map((result: any) => {
        if (result.errors && result.errors.length > 0) {
          console.error('Errores GraphQL en getPaginated:', result.errors);
        }
        
        const data = result.data?.findSucursalesPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
        
        // Procesar items para manejar campos nulos
        if (data.items && Array.isArray(data.items)) {
          data.items = data.items.map((item: any) => ({
            ...item,
            pais: item.pais || '',
            departamento: item.departamento || '',
            ciudad: item.ciudad || ''
          }));
        }
        
        return data;
      }),
      catchError((error) => {
        console.error('Error en getPaginated:', error);
        return of({ items: [], totalItems: 0, totalPages: 0, currentPage: 0 });
      })
    );
  }
}
