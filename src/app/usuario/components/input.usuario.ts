export interface Persona {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Rol {
  id?: number;
  tipoPersona: string;
}

export class InputUsuario {
  id?: number;
  contrasenha: string = '';
  persona: Persona = {
    nombre: '',
    apellido: '',
    email: ''
  };
  roles: Rol[] = [];

  constructor(init?: Partial<InputUsuario>) {
    if (init) {
      Object.assign(this, init);
      // Asegurar que persona y roles siempre existan
      if (!this.persona) {
        this.persona = { nombre: '', apellido: '', email: '' };
      }
      if (!this.roles) {
        this.roles = [];
      }
    }
  }

  // Métodos de conveniencia para mantener compatibilidad con el formulario
  get nombre(): string {
    return this.persona?.nombre || '';
  }

  set nombre(value: string) {
    if (!this.persona) this.persona = { nombre: '', apellido: '', email: '' };
    this.persona.nombre = value;
  }

  get apellido(): string {
    return this.persona?.apellido || '';
  }

  set apellido(value: string) {
    if (!this.persona) this.persona = { nombre: '', apellido: '', email: '' };
    this.persona.apellido = value;
  }

  get email(): string {
    return this.persona?.email || '';
  }

  set email(value: string) {
    if (!this.persona) this.persona = { nombre: '', apellido: '', email: '' };
    this.persona.email = value;
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
