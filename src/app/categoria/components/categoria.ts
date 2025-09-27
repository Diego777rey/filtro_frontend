
export class Categoria {
  id?: number;
  nombre: string = '';
  categoriaEstado: string = 'ACTIVO';
  constructor(init?: Partial<Categoria>) {
    Object.assign(this, init);
  }
}
