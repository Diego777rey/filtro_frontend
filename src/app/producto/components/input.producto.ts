import { Categoria } from "src/app/categoria/components/categoria";

export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  rubro: string;
  telefono: string;
  email: string;
  observaciones?: string;
}

export class InputProducto {
  id?: number;
  codigoProducto?: string;
  nombre: string = '';
  descripcion: string = '';
  precioCompra: number = 0;
  precioVenta: number = 0;
  stock: number = 0;
  productoEstado: string | boolean = 'ACTIVO';
  categoria?: Categoria;
  proveedor?: Proveedor;

  constructor(init?: Partial<InputProducto>) {
    Object.assign(this, init);
  }

  normalizePrices() {
    this.precioCompra = Math.max(0, this.precioCompra);
    this.precioVenta = Math.max(0, this.precioVenta);
  }

  toDto() {
    // Validar que la categoría tenga un ID válido
    const categoriaId = this.categoria?.id;
    if (!categoriaId || categoriaId === 0) {
      throw new Error('Categoría no válida');
    }

    // Validar que el proveedor tenga un ID válido
    const proveedorId = this.proveedor?.id;
    if (!proveedorId || proveedorId === 0) {
      throw new Error('Proveedor no válido');
    }

    // Convertir productoEstado a string si es boolean
    let estadoString: string;
    if (typeof this.productoEstado === 'boolean') {
      estadoString = this.productoEstado ? 'ACTIVO' : 'INACTIVO';
    } else {
      estadoString = this.productoEstado;
    }

    return {
      id: this.id,
      codigoProducto: this.codigoProducto,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precioCompra: this.precioCompra,
      precioVenta: this.precioVenta,
      stock: this.stock,
      productoEstado: estadoString,
      categoriaId: Number(categoriaId),
      proveedorId: Number(proveedorId)
    }
  }
}