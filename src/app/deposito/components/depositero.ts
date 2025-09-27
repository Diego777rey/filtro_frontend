export interface Depositero {
  id?: string;
  codigoDepositero: string;
  fechaIngreso: string;
  turno: string;
  almacenAsignado: string;
  supervisor: string;
  horario: string;
  estado: string;
  persona: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    telefono: string;
    email: string;
  };
}

export interface DepositeroPaginatedResponse {
  items: Depositero[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
