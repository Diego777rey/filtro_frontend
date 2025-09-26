export class Horario {
  id?: number;
  fechaHora: string;
  horarios: string;
  vendedor: {
    id: number;
    nombre: string;
  };

  constructor(data: any = {}) {
    this.id = data.id;
    this.fechaHora = data.fechaHora || '';
    this.horarios = data.horarios || '';
    this.vendedor = data.vendedor || { id: 0, nombre: '' };
  }

  toDto(): any {
    return {
      fechaHora: this.fechaHora,
      horarios: this.horarios,
      vendedorId: this.vendedor.id
    };
  }
}
