import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html'
})
export class BuscadorComponent {
  @Input() textoBusqueda: string = '';
  @Output() buscar = new EventEmitter<string>();
  @Output() limpiar = new EventEmitter<void>();

  onBuscar() {
    this.buscar.emit(this.textoBusqueda);
  }

  onLimpiar() {
    this.textoBusqueda = '';
    this.limpiar.emit();
  }
}
