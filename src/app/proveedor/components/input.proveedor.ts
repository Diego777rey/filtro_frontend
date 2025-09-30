export interface Persona {
  id: number;
  nombre?: string;
  apellido?: string;
}

export class InputProveedor {
  id?: number;
  ruc: string = '';
  razonSocial: string = '';
  rubro: string = '';
  telefono: string = '';
  email: string = '';
  persona?: Persona;
  observaciones?: string;

  constructor(init?: Partial<InputProveedor>) {
    Object.assign(this, init);
  }

  validateFields() {
    // Validar RUC (formato básico)
    if (!this.ruc || this.ruc.trim().length === 0) {
      throw new Error('RUC es obligatorio');
    }
    
    // Validar razón social
    if (!this.razonSocial || this.razonSocial.trim().length === 0) {
      throw new Error('Razón social es obligatoria');
    }
    
    // Validar email si se proporciona
    if (this.email && this.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        throw new Error('Formato de email inválido');
      }
    }
  }

  toDto() {
    this.validateFields();
    
    return {
      id: this.id,
      ruc: this.ruc.trim(),
      razonSocial: this.razonSocial.trim(),
      rubro: this.rubro?.trim() || '',
      telefono: this.telefono?.trim() || '',
      email: this.email?.trim() || '',
      personaId: this.persona?.id,
      observaciones: this.observaciones?.trim() || ''
    }
  }
}
