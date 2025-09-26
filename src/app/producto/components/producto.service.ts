import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { InputProducto } from './input.producto';
import { 
  CREATE_PRODUCTO, DELETE_PRODUCTO, GET_PRODUCTOS, GET_PRODUCTOS_BY_ID, GET_PRODUCTOS_PAGINADOS, UPDATE_PRODUCTO 
} from 'src/app/graphql/graphql/producto.graphql';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private apollo: Apollo) { }

  getAll(): Observable<InputProducto[]> {
    return this.apollo.watchQuery({
      query: GET_PRODUCTOS
    }).valueChanges.pipe(
      map((result: any) => result.data.findAllProductos || [])
    );
  }

  getById(id: number): Observable<InputProducto> {
    return this.apollo.watchQuery({
      query: GET_PRODUCTOS_BY_ID,
      variables: { productoId: id }
    }).valueChanges.pipe(
      map((result: any) => result.data.findProductoById)
    );
  }

  getPaginated(page: number, size: number, search: string = ''): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_PRODUCTOS_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map((result: any) => {
        if (result.errors) console.error('GraphQL errors:', result.errors);
        return result.data?.findProductosPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
      }),
      catchError((err: any) => throwError(() => err))
    );
  }

  create(producto: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_PRODUCTO,
      variables: { input: producto }
    }).pipe(
      map((result: any) => {
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0]?.message || 'Error al crear producto');
        }
        return result.data.createProducto;
      }),
      catchError((err: any) => {
        console.error('Error creating producto:', err);
        return throwError(() => err);
      })
    );
  }

  update(id: number, producto: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_PRODUCTO,
      variables: { id, input: producto }
    }).pipe(
      map((result: any) => {
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0]?.message || 'Error al actualizar producto');
        }
        return result.data.updateProducto;
      }),
      catchError((err: any) => {
        console.error('Error updating producto:', err);
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_PRODUCTO,
      variables: { id }
    }).pipe(
      map((result: any) => result.data.deleteProducto)
    );
  }
}
