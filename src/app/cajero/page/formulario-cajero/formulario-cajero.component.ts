import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CajeroService } from '../../components/cajero.service';
import { Cajero } from '../../components/cajero';
import { Persona } from '../../../Personas/components/persona';
import { CajaService } from '../../../caja/components/caja.service';
import { Caja as CajaModel } from '../../../caja/components/caja';
import { Caja } from '../../components/cajero';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-formulario-cajero',
  templateUrl: './formulario-cajero.component.html',
  styleUrls: ['./formulario-cajero.component.scss']
})
export class FormularioCajeroComponent implements OnInit, OnDestroy {
  titulo = 'Cajero';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  isEdit = false;
  cajeroId: string | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs
  personaSeleccionada: Persona | null = null;
  cajaSeleccionada: CajaModel | null = null;
  cajas: CajaModel[] = []; // Lista de cajas disponibles

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cajeroService: CajeroService,
    private cajaService: CajaService,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.initForm();
    this.loadCajas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    // Todos los campos específicos de cajero según el esquema GraphQL
    this.formGroup = this.fb.group({
      codigoCajero: [{value: '', disabled: !this.isEdit}, [Validators.required]],
      turno: [{value: '', disabled: !this.isEdit}, [Validators.required]],
      fechaIngreso: [{value: '', disabled: !this.isEdit}, [Validators.required]],
      estado: [{value: 'ACTIVO', disabled: !this.isEdit}, [Validators.required]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.cajeroId = id;
      this.loadCajero(Number(id));
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadCajero(id: number): void {
    this.loading = true;
    this.cajeroService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Cajero | null) => {
        if (data) {
          this.formGroup.patchValue({
            codigoCajero: data.codigoCajero,
            turno: data.turno,
            fechaIngreso: data.fechaIngreso,
            estado: data.estado
          });
          // Establecer la persona y caja seleccionadas
          this.personaSeleccionada = data.persona;
          
          // Buscar la caja completa en la lista para mostrar en el select
          if (data.caja && data.caja.id) {
            const cajaCompleta = this.cajas.find(c => c.id?.toString() === data.caja.id);
            if (cajaCompleta) {
              this.cajaSeleccionada = cajaCompleta;
            }
          }
        }
        this.loading = false;
      });
  }


  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset();
    this.personaSeleccionada = null;
    this.cajaSeleccionada = null;
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.personaSeleccionada = null;
    this.cajaSeleccionada = null;
    this.formEnabled = false;
    this.formGroup.disable();
  }

  volver(): void {
    this.router.navigate(['dashboard/cajero']);
  }

  // Método para cargar las cajas disponibles
  loadCajas(): void {
    this.cajaService.getAll()
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe((cajas: CajaModel[]) => {
        this.cajas = cajas;
      });
  }

  // Método para manejar la selección de persona
  onPersonaSeleccionada(persona: Persona | null): void {
    this.personaSeleccionada = persona;
  }

  // Método para manejar la selección de caja
  onCajaSeleccionada(caja: CajaModel | null): void {
    this.cajaSeleccionada = caja;
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      console.error('Formulario inválido:', this.formGroup.errors);
      this.formGroup.markAllAsTouched();
      this.snackBar.open('Por favor, complete todos los campos obligatorios correctamente', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validación de persona y caja seleccionadas
    if (!this.personaSeleccionada) {
      this.snackBar.open('Error: Debe seleccionar una persona', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.cajaSeleccionada) {
      this.snackBar.open('Error: Debe seleccionar una caja', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const formValue = this.formGroup.value;
      
      const cajeroData = {
        codigoCajero: formValue.codigoCajero,
        turno: formValue.turno,
        fechaIngreso: formValue.fechaIngreso,
        estado: formValue.estado,
        persona: this.personaSeleccionada,
        caja: this.cajaSeleccionada ? {
          id: this.cajaSeleccionada.id?.toString() || '',
          codigoCaja: this.cajaSeleccionada.codigoCaja || ''
        } : null
      };
      
      console.log('Datos del cajero a enviar:', cajeroData); // Para debugging

      const obs$ = this.isEdit && this.cajeroId
        ? this.cajeroService.updateCajeroWithPersona(Number(this.cajeroId), cajeroData)
        : this.cajeroService.createCajeroWithPersona(cajeroData);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar cajero:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar el cajero';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un cajero con ese documento o email. Por favor, verifique los datos.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un cajero con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el cajero: ' + error.message;
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        })
      ).subscribe((result) => {
        if (result) {
          // Cajero guardado exitosamente
          this.loading = false;
          this.formEnabled = false;
          this.formGroup.disable();
          this.snackBar.open('Cajero guardado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/cajero']);
        }
      });
    } catch (error) {
      console.error('Error al crear el cajero:', error);
      this.loading = false;
      this.snackBar.open('Error al crear el cajero: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
