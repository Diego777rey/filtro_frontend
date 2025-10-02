import { Persona } from '../../Personas/components/persona';

export interface Cliente {
  id?: number;
  codigoCliente: string;
  fechaRegistro: string;
  persona: Persona;
}
