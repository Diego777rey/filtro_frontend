// Removed Persona import as we're using flat structure now

export interface Rol {
  id?: number;
  tipoPersona: string;
}

export class InputUsuario {
  id?: number;
  contrasenha: string = '';
  // Campos planos para el UsuarioInput
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  roles: Rol[] = [];

  constructor(init?: Partial<InputUsuario>) {
    if (init) {
      Object.assign(this, init);
      // Asegurar que roles siempre exista
      if (!this.roles) {
        this.roles = [];
      }
    }
  }

  // Métodos de conveniencia para mantener compatibilidad con el formulario
  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`.trim();
  }

  set nombreCompleto(value: string) {
    const partes = value.split(' ');
    this.nombre = partes[0] || '';
    this.apellido = partes.slice(1).join(' ') || '';
  }

  get rol(): string {
    return this.roles?.[0]?.tipoPersona || '';
  }

  set rol(value: string) {
    if (!this.roles) this.roles = [];
    if (this.roles.length === 0) {
      this.roles.push({ tipoPersona: value });
    } else {
      this.roles[0].tipoPersona = value;
    }
  }
}
