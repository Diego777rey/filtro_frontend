export interface Persona {
  id?: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  email: string;
  direccion?: string;
  estadoPersona?: string;
  fechaNacimiento?: string;
  roles?: Array<{
    id?: number;
    tipoPersona: string;
  }>;
}

export class Vendedor {
  id?: number;
  codigoVendedor: string = '';
  comision: number = 0;
  sucursal: string = '';
  persona: Persona = {
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: ''
  };

  constructor(init?: Partial<Vendedor>) {
    if (init) {
      Object.assign(this, init);
      if (init.persona) {
        this.persona = { ...this.persona, ...init.persona };
      }
    }
  }
}
