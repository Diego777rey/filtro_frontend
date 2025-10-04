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
  codigoVenta?: string;
  fechaVenta?: string;
  total?: number;
  tipoVenta?: string;
  estadoVenta?: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'FACTURADA' | 'ENTREGADA';
  estado?: 'pendiente' | 'aceptada' | 'cancelada';
  cliente?: {
    id: number;
    codigoCliente?: string;
    persona?: {
      id: number;
      nombre: string;
      apellido: string;
      documento?: string;
      telefono?: string;
      email?: string;
    };
  };
  vendedor?: {
    id: number;
    persona: {
      id: number;
      nombre: string;
      apellido: string;
    };
  };
  caja?: {
    id: number;
    codigoCaja?: string;
  };
  detalles?: {
    id: number;
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
    subtotal: number;
    producto: {
      id: number;
      nombre: string;
      precioVenta: number;
    };
  }[];
  items?: {
    id: number;
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
    subtotal: number;
    producto: {
      id: number;
      nombre: string;
      precioVenta: number;
    };
  }[];
  fechaAprobacion?: string;
  fechaCancelacion?: string;
  motivoCancelacion?: string;
}

export interface MovimientoCajaPaginatedResponse {
  items: MovimientoCaja[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
