import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccionTabla } from './accion.tabla';

@Component({
  selector: 'app-tabla-paginada',
  templateUrl: './tabla-paginada.component.html',
  styleUrls: ['./tabla-paginada.component.scss']
})
export class TablaPaginadaComponent<T> {
  @Input() datos: T[] = [];
  @Input() columnasVisibles: string[] = [];
  @Input() nombresColumnas: { [key: string]: string } = {};
  @Input() totalRegistros = 0;
  @Input() tamanioPagina = 5;
  @Input() paginaActual = 0;
  @Input() cargando = false;

  @Output() cambiarPagina = new EventEmitter<PageEvent>();
  @Output() ejecutarAccion = new EventEmitter<AccionTabla<T>>();

  accionFila(evento: AccionTabla<T>) {
    this.ejecutarAccion.emit(evento);
  }

  paginaCambiada(evento: PageEvent) {
    this.cambiarPagina.emit(evento);
  }
}
