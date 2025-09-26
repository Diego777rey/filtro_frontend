import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AccionTabla } from '../tabla-paginada/accion.tabla';

@Component({
  selector: 'app-acciones',
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.scss']
})
export class AccionesComponent<T> {

  // 🔹 Fila de la tabla
  @Input() fila!: T;

  // 🔹 Mostrar botones
  @Input() mostrarEditar = true;
  @Input() mostrarEliminar = true;
  @Input() mostrarVer = false;
  @Input() mostrarCustom = false;

  //Evento que emite la acción seleccionada
  @Output() accion = new EventEmitter<AccionTabla<T>>();

  //Ejecutar acción y emitir al componente padre
  ejecutarAccion(tipo: 'editar' | 'eliminar' | 'ver' | 'custom') {
    if (!this.fila) return;
    this.accion.emit({ tipo, fila: this.fila });
  }
}
