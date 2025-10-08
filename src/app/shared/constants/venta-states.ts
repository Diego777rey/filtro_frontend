/**
 * Constantes para los estados de venta
 * Centraliza todos los valores posibles para evitar duplicación y errores
 */
export const VENTA_STATES = {
  // Estados principales
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA', 
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
  FACTURADA: 'FACTURADA',
  ENTREGADA: 'ENTREGADA',
  
  // Estados alternativos (para compatibilidad)
  PENDIENTE_ALT: 'pendiente',
  ACEPTADA: 'aceptada',
  CANCELADA_ALT: 'cancelada'
} as const;

/**
 * Estados que indican que una venta está pendiente
 */
export const PENDING_STATES = [
  VENTA_STATES.PENDIENTE,
  VENTA_STATES.PENDIENTE_ALT,
  null,
  undefined
] as const;

/**
 * Estados que indican que una venta fue procesada/aceptada
 */
export const PROCESSED_STATES = [
  VENTA_STATES.APROBADA,
  VENTA_STATES.COMPLETADA,
  VENTA_STATES.ACEPTADA
] as const;

/**
 * Estados que indican que una venta fue cancelada
 */
export const CANCELLED_STATES = [
  VENTA_STATES.CANCELADA,
  VENTA_STATES.CANCELADA_ALT
] as const;

/**
 * Tipo para los estados de venta
 */
export type VentaState = typeof VENTA_STATES[keyof typeof VENTA_STATES];
