import { Persona } from '../../Personas/components/persona';

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
