import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CajaService } from '../../components/caja.service';
import { Caja } from '../../components/caja';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulario-caja',
  templateUrl: './formulario-caja.component.html',
  styleUrls: ['./formulario-caja.component.scss']
})
export class FormularioCajaComponent implements OnInit, OnDestroy {
  titulo = 'Caja';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoFormulario[] = [];
  isEdit = false;
  cajaId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cajaService: CajaService,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.initCampos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCampos(): void {
    this.campos = [
      { control: 'codigoCaja', label: 'Código de Caja', tipo: 'text', placeholder: 'Ingrese código de la caja', requerido: true },
      { control: 'descripcion', label: 'Descripción', tipo: 'text', placeholder: 'Ingrese descripción de la caja', requerido: true },
      { control: 'ubicacion', label: 'Ubicación', tipo: 'text', placeholder: 'Ingrese ubicación de la caja', requerido: true },
      { control: 'estadoCaja', label: 'Estado', tipo: 'select', placeholder: 'Seleccione estado', requerido: true, opciones: [
        { value: 'ABIERTA', label: 'Abierta' },
        { value: 'CERRADA', label: 'Cerrada' }
      ]},
      { control: 'saldoInicial', label: 'Saldo Inicial', tipo: 'number', placeholder: 'Ingrese saldo inicial', requerido: true },
      { control: 'saldoActual', label: 'Saldo Actual', tipo: 'number', placeholder: 'Ingrese saldo actual', requerido: true },
      { control: 'cajaEstado', label: 'Estado Activo', tipo: 'checkbox' }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      const disabled = !this.isEdit; // Habilitar si estamos editando
      
      // Para checkbox, usar true como valor por defecto (activo por defecto)
      const defaultValue = campo.tipo === 'checkbox' ? true : '';
      this.formGroup.addControl(campo.control, this.fb.control({value: defaultValue, disabled: disabled}, validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.cajaId = Number(id);
      this.loadCaja(this.cajaId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadCaja(id: number): void {
    this.loading = true;
    this.cajaService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Caja | null) => {
        if (data) {
          this.formGroup.patchValue({
            codigoCaja: data.codigoCaja,
            descripcion: data.descripcion,
            ubicacion: data.ubicacion,
            estadoCaja: data.estadoCaja,
            saldoInicial: data.saldoInicial,
            saldoActual: data.saldoActual,
            cajaEstado: data.estadoCaja === 'ABIERTA'
          });
        }
        this.loading = false;
      });
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset({ 
      codigoCaja: '',
      descripcion: '',
      ubicacion: '',
      estadoCaja: 'ABIERTA',
      saldoInicial: 0,
      saldoActual: 0,
      cajaEstado: true 
    });
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.formEnabled = false;
    this.formGroup.disable();
  }

  volver(): void {
    this.router.navigate(['dashboard/caja']);
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.snackBar.open('Por favor, complete todos los campos obligatorios correctamente', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validación básica de descripción
    const formValue = this.formGroup.value;
    if (!formValue.descripcion || formValue.descripcion.trim().length === 0) {
      this.snackBar.open('Error: La descripción es obligatoria', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const caja: Caja = {
        codigoCaja: formValue.codigoCaja,
        descripcion: formValue.descripcion,
        ubicacion: formValue.ubicacion,
        estadoCaja: formValue.estadoCaja,
        saldoInicial: Number(formValue.saldoInicial),
        saldoActual: Number(formValue.saldoActual)
      };

      const obs$ = this.isEdit && this.cajaId
        ? this.cajaService.update(this.cajaId, caja)
        : this.cajaService.create(caja);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar caja:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar la caja';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe una caja con ese código. Por favor, usa un código diferente.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe una caja con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar la caja: ' + error.message;
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        })
      ).subscribe((result) => {
        if (result) {
          this.loading = false;
          this.formEnabled = false;
          this.snackBar.open('Caja guardada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/caja']);
        }
      });
    } catch (error) {
      console.error('Error al crear la caja:', error);
      this.loading = false;
      this.snackBar.open('Error al crear la caja: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
