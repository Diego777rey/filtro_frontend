import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Servicio base para operaciones CRUD que evita duplicación de código
 * entre diferentes módulos que usan GraphQL
 */
@Injectable({
  providedIn: 'root'
})
export class BaseCrudService {

  constructor(private apollo: Apollo) { }

  /**
   * Método genérico para ejecutar queries GraphQL
   */
  protected executeQuery<T>(query: any, variables?: any): Observable<T> {
    return this.apollo.watchQuery<{ [key: string]: T }>({
      query,
      variables
    }).valueChanges.pipe(
      map(result => {
        const data = result.data;
        const keys = Object.keys(data);
        return data[keys[0]];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Método genérico para ejecutar mutations GraphQL
   */
  protected executeMutation<T>(mutation: any, variables?: any): Observable<T> {
    return this.apollo.mutate<{ [key: string]: T }>({
      mutation,
      variables
    }).pipe(
      map(result => {
        const data = result.data!;
        const keys = Object.keys(data);
        return data[keys[0]];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Método genérico para ejecutar queries paginadas
   */
  protected executePaginatedQuery<T>(
    query: any, 
    page: number, 
    size: number, 
    search?: string,
    variables?: any
  ): Observable<T> {
    const queryVariables = {
      page: page + 1, // GraphQL espera página basada en 1
      size,
      search,
      ...variables
    };

    return this.executeQuery<T>(query, queryVariables);
  }

  /**
   * Manejo centralizado de errores para evitar duplicación
   */
  protected handleError = (error: any): Observable<never> => {
    console.error('Error en servicio:', error);
    throw error;
  }

  /**
   * Método para formatear fechas de manera consistente
   */
  protected formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  /**
   * Método para formatear moneda de manera consistente
   */
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  /**
   * Método para obtener colores de estado de manera consistente
   */
  protected getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'warn';
      case 'confirmada': 
      case 'aceptada': return 'primary';
      case 'cancelada': 
      case 'entregada': return 'accent';
      default: return '';
    }
  }

  /**
   * Método para obtener iconos de estado de manera consistente
   */
  protected getEstadoIcon(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'schedule';
      case 'confirmada': 
      case 'aceptada': return 'check_circle';
      case 'cancelada': return 'cancel';
      case 'entregada': return 'local_shipping';
      default: return 'help';
    }
  }
}
