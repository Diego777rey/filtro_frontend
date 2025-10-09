export class Sucursal {
  id?: number;
  nombre: string = '';
  pais?: string | null = null;
  departamento?: string | null = null;
  ciudad?: string | null = null;
  direccion: string = '';
  telefono: string = '';
  
  constructor(init?: Partial<Sucursal>) {
    Object.assign(this, init);
  }
}
