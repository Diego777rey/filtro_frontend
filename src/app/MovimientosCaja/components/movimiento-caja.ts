export interface MovimientoCaja {
  id?: number;
  monto: number;
  tipo: string;
  fecha: string;
  descripcion?: string;
  caja?: {
    id: number;
    nombre: string;
  };
  venta?: {
    id: number;
    total: number;
    estado: string;
  };
}

export interface Venta {
  id?: number;
  total: number;
  estado: string;
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  vendedor?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  items?: {
    id: number;
    cantidad: number;
    precio: number;
    producto: {
      id: number;
      nombre: string;
    };
  }[];
}

export interface MovimientoCajaPaginatedResponse {
  items: MovimientoCaja[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
