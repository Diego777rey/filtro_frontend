import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {
  VENTAS_QUERY,
  VENTA_BY_ID_QUERY,
  CREAR_VENTA_MUTATION,
  ACTUALIZAR_VENTA_MUTATION,
  ELIMINAR_VENTA_MUTATION
} from 'src/app/graphql/graphql/venta.graphql';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private apollo: Apollo) { }

  obtenerVentas(): Observable<any[]> {
    return this.apollo.watchQuery({
      query: VENTAS_QUERY,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data.ventas)
    );
  }

  obtenerVentaPorId(id: number): Observable<any> {
    return this.apollo.watchQuery({
      query: VENTA_BY_ID_QUERY,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data.venta)
    );
  }

  crearVenta(ventaData: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREAR_VENTA_MUTATION,
      variables: { input: ventaData },
      refetchQueries: [{
        query: VENTAS_QUERY
      }]
    }).pipe(
      map((result: any) => result.data.crearVenta)
    );
  }

  actualizarVenta(id: number, ventaData: any): Observable<any> {
    return this.apollo.mutate({
      mutation: ACTUALIZAR_VENTA_MUTATION,
      variables: { id, input: ventaData },
      refetchQueries: [{
        query: VENTAS_QUERY
      }]
    }).pipe(
      map((result: any) => result.data.actualizarVenta)
    );
  }

  eliminarVenta(id: number): Observable<any> {
    return this.apollo.mutate({
      mutation: ELIMINAR_VENTA_MUTATION,
      variables: { id },
      refetchQueries: [{
        query: VENTAS_QUERY
      }]
    }).pipe(
      map((result: any) => result.data.eliminarVenta)
    );
  }
}