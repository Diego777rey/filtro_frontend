import { Categoria } from "src/app/categoria/components/categoria";

export class InputProducto {
  id?: number;
  descripcion: string = '';
  precioCompra: number = 0;
  precioVenta: number = 0;
  stock: number = 0;
  activo: boolean = true;
  categoria?: Categoria;

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

    return {
      id: this.id,
      descripcion: this.descripcion,
      precioCompra: this.precioCompra,
      precioVenta: this.precioVenta,
      stock: this.stock,
      activo: this.activo,
      categoriaId: Number(categoriaId)
    }
  }
}