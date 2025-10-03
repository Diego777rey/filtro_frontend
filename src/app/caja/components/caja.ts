export interface Caja {
  id?: number;
  codigoCaja?: string;
  descripcion?: string;
  ubicacion?: string;
  estadoCaja?: 'ABIERTA' | 'CERRADA';
  saldoInicial?: number;
  saldoActual?: number;
  cajeroActual?: {
    id: number;
    codigoCajero: string;
    persona: {
      nombre: string;
      apellido: string;
    };
  };
  fechaApertura?: string;
  fechaCierre?: string;
  saldoApertura?: number;
  saldoCierre?: number;
}
