import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { InputProducto } from './input.producto';
import { InputProveedor } from 'src/app/proveedor/components/input.proveedor';
import { Sucursal } from 'src/app/sucursal/components/sucursal';
import { 
  CREATE_PRODUCTO, DELETE_PRODUCTO, GET_PRODUCTOS, GET_PRODUCTOS_BY_ID, GET_PRODUCTOS_PAGINADOS, UPDATE_PRODUCTO 
} from 'src/app/graphql/producto.graphql';

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
    console.log('Consultando productos con:', { page, size, search });
    
    // Usar consulta completa que incluye categoria y proveedor
    return this.apollo.watchQuery({
      query: GET_PRODUCTOS_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map((result: any) => {
        console.log('Resultado completo de GraphQL:', result);
        
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          result.errors.forEach((error: any, index: number) => {
            console.error(`Error ${index + 1}:`, error.message, error.locations, error.path);
          });
        }
        
        const data = result.data?.findProductosPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
        console.log('Datos procesados:', data);
        
        // Mapear los datos completos a InputProducto
        const mappedItems = data.items?.map((producto: any) => {
          return this.mapGraphQLToInputProducto(producto);
        }) || [];
        
        return {
          ...data,
          items: mappedItems
        };
      }),
      catchError((err: any) => {
        console.error('Error en la consulta GraphQL:', err);
        return throwError(() => err);
      })
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
      proveedor: graphqlProducto.proveedor ? new InputProveedor({
        id: graphqlProducto.proveedor.id,
        ruc: graphqlProducto.proveedor.ruc,
        razonSocial: graphqlProducto.proveedor.razonSocial,
        rubro: graphqlProducto.proveedor.rubro,
        telefono: graphqlProducto.proveedor.telefono,
        email: graphqlProducto.proveedor.email,
        observaciones: graphqlProducto.proveedor.observaciones
      }) : undefined,
      sucursal: graphqlProducto.sucursal ? new Sucursal({
        id: graphqlProducto.sucursal.id,
        nombre: graphqlProducto.sucursal.nombre,
        pais: graphqlProducto.sucursal.pais,
        departamento: graphqlProducto.sucursal.departamento,
        ciudad: graphqlProducto.sucursal.ciudad,
        direccion: graphqlProducto.sucursal.direccion,
        telefono: graphqlProducto.sucursal.telefono
      }) : undefined
    });
  }
}
