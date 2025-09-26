export interface AccionTabla<T> {
  tipo: 'editar' | 'eliminar' | 'ver' | 'custom';
  fila: T;
}
