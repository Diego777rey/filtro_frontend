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

export interface Cliente {
  id?: number;
  codigoCliente: string;
  fechaRegistro: string;
  persona: Persona;
}
