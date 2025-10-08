import { VENTA_STATES, PENDING_STATES, PROCESSED_STATES, CANCELLED_STATES } from '../constants/venta-states';

/**
 * Utilidades para manejar estados de venta
 * Centraliza la lógica de estados para evitar duplicación
 */
export class VentaStateUtil {
  
  /**
   * Verifica si una venta está pendiente
   * Optimizado para prevenir stack overflow
   */
  static isPending(venta: { estado?: string; estadoVenta?: string }): boolean {
    if (!venta) return false;
    
    const estado = venta.estado;
    const estadoVenta = venta.estadoVenta;
    
    // Verificar si ambos campos indican pendiente
    const estadoPendiente = estado === null || estado === undefined || estado === 'pendiente' || estado === 'PENDIENTE';
    const estadoVentaPendiente = estadoVenta === null || estadoVenta === undefined || estadoVenta === 'PENDIENTE';
    
    return estadoPendiente && estadoVentaPendiente;
  }

  /**
   * Verifica si una venta fue procesada/aceptada
   * Optimizado para prevenir stack overflow
   */
  static isProcessed(venta: { estado?: string; estadoVenta?: string }): boolean {
    if (!venta) return false;
    
    const estado = venta.estado;
    const estadoVenta = venta.estadoVenta;
    
    return (estado === 'aceptada' || estado === 'APROBADA' || estado === 'COMPLETADA') ||
           (estadoVenta === 'APROBADA' || estadoVenta === 'COMPLETADA');
  }

  /**
   * Verifica si una venta fue cancelada
   * Optimizado para prevenir stack overflow
   */
  static isCancelled(venta: { estado?: string; estadoVenta?: string }): boolean {
    if (!venta) return false;
    
    const estado = venta.estado;
    const estadoVenta = venta.estadoVenta;
    
    return (estado === 'cancelada' || estado === 'CANCELADA') ||
           (estadoVenta === 'CANCELADA');
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  static getStateClass(venta: { estado?: string; estadoVenta?: string }): string {
    if (this.isPending(venta)) return 'estado-pendiente';
    if (this.isProcessed(venta)) return 'estado-aceptada';
    if (this.isCancelled(venta)) return 'estado-cancelada';
    return 'estado-pendiente';
  }

  /**
   * Obtiene el icono para el estado
   */
  static getStateIcon(venta: { estado?: string; estadoVenta?: string }): string {
    if (this.isPending(venta)) return 'schedule';
    if (this.isProcessed(venta)) return 'check_circle';
    if (this.isCancelled(venta)) return 'cancel';
    return 'schedule';
  }

  /**
   * Obtiene el texto para el estado
   */
  static getStateText(venta: { estado?: string; estadoVenta?: string }): string {
    if (this.isPending(venta)) return 'Pendiente';
    if (this.isProcessed(venta)) return 'Aceptada';
    if (this.isCancelled(venta)) return 'Cancelada';
    return 'Pendiente';
  }

  /**
   * Obtiene la clase CSS para la fila
   */
  static getRowClass(venta: { estado?: string; estadoVenta?: string }): string {
    if (this.isProcessed(venta)) return 'row-accepted';
    if (this.isCancelled(venta)) return 'row-cancelled';
    return '';
  }

  /**
   * Filtra ventas pendientes de manera eficiente
   */
  static filterPendingVentas<T extends { estado?: string; estadoVenta?: string }>(ventas: T[]): T[] {
    return ventas.filter(venta => this.isPending(venta));
  }
}
