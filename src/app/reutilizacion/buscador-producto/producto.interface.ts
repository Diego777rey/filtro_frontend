export interface Producto {
  id: number;
  descripcion: string;
  precio: number;
  stock?: number;
  categoriaId?: number;
  categoria?: {
    id: number;
    nombre: string;
  };
  codigo?: string;
  activo?: boolean;
  fechaCreacion?: Date;
}
