export class Horario {
  id?: number;
  fechaHora: string;
  horarios: string;
  persona: {
    id: number;
    nombre: string;
  };

  constructor(data: any = {}) {
    this.id = data.id;
    this.fechaHora = data.fechaHora || '';
    this.horarios = data.horarios || '';
    this.persona = data.persona || { id: 0, nombre: '' };
  }

  toDto(): any {
    return {
      fechaHora: this.fechaHora,
      horarios: this.horarios,
      personaId: this.persona.id
    };
  }
}
