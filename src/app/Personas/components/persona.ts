export interface Persona {
  id?: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  email: string;
  documento: string;
  estadoPersona: string;
  fechaNacimiento: string;
  roles?: {
    id: string;
    tipoPersona: string;
  }[];
}

export interface PersonaPaginatedResponse {
  items: Persona[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
