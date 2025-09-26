
export class Categoria {
  id?: number;
  descripcion: string = '';
  constructor(init?: Partial<Categoria>) {
    Object.assign(this, init);
  }
}
