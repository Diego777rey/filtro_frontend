import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CampoFormulario } from './campo.formulario';

@Component({
  selector: 'app-formulario-generico',
  templateUrl: './formulario-generico.component.html',
  styleUrls: ['./formulario-generico.component.scss']
})
export class FormularioGenericoComponent implements OnChanges {
  @Input() titulo = 'Formulario';
  @Input() formGroup!: FormGroup;
  @Input() campos: CampoFormulario[] = [];
  @Input() isEdit = false;
  @Input() loading = false;
  @Input() formEnabled = false;
  @Output() guardarEvento = new EventEmitter<void>();
  @Output() cancelarEvento = new EventEmitter<void>();
  @Output() nuevoEvento = new EventEmitter<void>();
  @Output() volverEvento = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formEnabled'] && this.formGroup) {
      if (this.formEnabled) {
        this.formGroup.enable({ emitEvent: false });
      } else {
        this.formGroup.disable({ emitEvent: false });
      }
    }
  }

  guardar() {
    this.guardarEvento.emit();
  }

  cancelar() {
    this.cancelarEvento.emit();
  }

  nuevo() {
    this.nuevoEvento.emit();
  }

  volver() {
    this.volverEvento.emit();
  }

}