import { Persona } from '../../Personas/components/persona';

export interface Caja {
  id: string;
  codigoCaja: string;
}

export class Cajero {
  id?: number;
  codigoCajero: string = '';
  turno: string = '';
  fechaIngreso: string = '';
  estado: string = '';
  caja: Caja = {
    id: '',
    codigoCaja: ''
  };
  persona: Persona = {
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: ''
  };

  constructor(init?: Partial<Cajero>) {
    if (init) {
      Object.assign(this, init);
      if (init.persona) {
        this.persona = { ...this.persona, ...init.persona };
      }
      if (init.caja) {
        this.caja = { ...this.caja, ...init.caja };
      }
    }
  }
}
