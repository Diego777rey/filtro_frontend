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
      map((result: any) => {
        const productos = result.data?.findAllProductos || [];
        return productos.map((producto: any) => this.mapGraphQLToInputProducto(producto));
      })
    );
  }

  getById(id: number): Observable<InputProducto> {
    return this.apollo.watchQuery({
      query: GET_PRODUCTOS_BY_ID,
      variables: { productoId: id }
    }).valueChanges.pipe(
      map((result: any) => this.mapGraphQLToInputProducto(result.data?.findProductoById))
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
        const data = result.data?.findProductosPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
        return {
          ...data,
          items: data.items?.map((producto: any) => this.mapGraphQLToInputProducto(producto)) || []
        };
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
        return this.mapGraphQLToInputProducto(result.data.createProducto);
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
        return this.mapGraphQLToInputProducto(result.data.updateProducto);
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

  // Método para mapear la respuesta de GraphQL a InputProducto
  private mapGraphQLToInputProducto(graphqlProducto: any): InputProducto {
    if (!graphqlProducto) return new InputProducto();

    return new InputProducto({
      id: graphqlProducto.id,
      codigoProducto: graphqlProducto.codigoProducto,
      nombre: graphqlProducto.nombre,
      descripcion: graphqlProducto.descripcion,
      precioCompra: graphqlProducto.precioCompra,
      precioVenta: graphqlProducto.precioVenta,
      stock: graphqlProducto.stock,
      productoEstado: graphqlProducto.productoEstado,
      categoria: graphqlProducto.categoria ? {
        id: graphqlProducto.categoria.id,
        nombre: graphqlProducto.categoria.nombre,
        categoriaEstado: graphqlProducto.categoria.categoriaEstado
      } : undefined,
      proveedor: graphqlProducto.proveedor ? {
        id: graphqlProducto.proveedor.id,
        ruc: graphqlProducto.proveedor.ruc,
        razonSocial: graphqlProducto.proveedor.razonSocial,
        rubro: graphqlProducto.proveedor.rubro,
        telefono: graphqlProducto.proveedor.telefono,
        email: graphqlProducto.proveedor.email,
        persona: graphqlProducto.proveedor.persona,
        observaciones: graphqlProducto.proveedor.observaciones
      } : undefined
    });
  }
}
