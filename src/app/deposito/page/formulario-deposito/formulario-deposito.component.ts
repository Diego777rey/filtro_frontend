import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepositeroService } from '../../components/depositero.service';
import { Depositero } from '../../components/depositero';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoDepositoFormulario } from './campo-deposito.formulario';

@Component({
  selector: 'app-formulario-deposito',
  templateUrl: './formulario-deposito.component.html',
  styleUrls: ['./formulario-deposito.component.scss']
})
export class FormularioDepositoComponent implements OnInit, OnDestroy {
  titulo = 'Depositero';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoDepositoFormulario[] = [];
  isEdit = false;
  depositeroId: string | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private depositeroService: DepositeroService,
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
      { control: 'codigoDepositero', label: 'Código Depositero', tipo: 'text', placeholder: 'Ingrese código', requerido: true },
      { control: 'fechaIngreso', label: 'Fecha de Ingreso', tipo: 'date', placeholder: 'Seleccione fecha', requerido: true },
      { control: 'turno', label: 'Turno', tipo: 'text', placeholder: 'Ingrese turno', requerido: true },
      { control: 'almacenAsignado', label: 'Almacén Asignado', tipo: 'text', placeholder: 'Ingrese almacén', requerido: true },
      { control: 'supervisor', label: 'Supervisor', tipo: 'text', placeholder: 'Ingrese supervisor', requerido: true },
      { control: 'horario', label: 'Horario', tipo: 'text', placeholder: 'Ingrese horario', requerido: true },
      { 
        control: 'estado', 
        label: 'Estado', 
        tipo: 'select', 
        placeholder: 'Seleccione estado', 
        requerido: true,
        opciones: [
          { value: 'ACTIVO', label: 'Activo' },
          { value: 'INACTIVO', label: 'Inactivo' }
        ]
      },
      { 
        control: 'personaId', 
        label: 'Persona', 
        tipo: 'select', 
        placeholder: 'Seleccione persona', 
        requerido: true,
        opciones: [] // Se llenará dinámicamente
      }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      const disabled = !this.isEdit; // Habilitar si estamos editando
      
      // Establecer valor por defecto
      let defaultValue: any = '';
      if (campo.control === 'fechaIngreso') {
        defaultValue = new Date(); // Fecha actual
      } else if (campo.control === 'estado') {
        defaultValue = 'ACTIVO'; // Estado activo por defecto
      }
      
      this.formGroup.addControl(campo.control, this.fb.control({value: defaultValue, disabled: disabled}, validators));
    });

    // Cargar opciones de personas
    this.loadPersonas();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.depositeroId = id;
      this.loadDepositero(this.depositeroId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadDepositero(id: string): void {
    this.loading = true;
    this.depositeroService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Depositero | null) => {
        if (data) {
          this.formGroup.patchValue({
            codigoDepositero: data.codigoDepositero,
            fechaIngreso: data.fechaIngreso,
            turno: data.turno,
            almacenAsignado: data.almacenAsignado,
            supervisor: data.supervisor,
            horario: data.horario,
            estado: data.estado,
            personaId: data.persona?.id || ''
          });
        }
        this.loading = false;
      });
  }

  loadPersonas(): void {
    // Aquí deberías cargar las personas disponibles para el select
    // Por ahora usamos opciones estáticas, pero puedes implementar un servicio de personas
    const personaField = this.campos.find(c => c.control === 'personaId');
    if (personaField) {
      personaField.opciones = [
        { value: '1', label: 'Persona 1' },
        { value: '2', label: 'Persona 2' },
        { value: '3', label: 'Persona 3' }
      ];
    }
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset({ 
      estado: 'ACTIVO',
      fechaIngreso: new Date() // Establecer fecha actual por defecto
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
    this.router.navigate(['dashboard/deposito']);
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

    // Validación básica de campos obligatorios
    const formValue = this.formGroup.value;
    if (!formValue.codigoDepositero || formValue.codigoDepositero.trim().length === 0) {
      this.snackBar.open('Error: El código del depositero es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const depositeroData = {
        codigoDepositero: formValue.codigoDepositero,
        fechaIngreso: formValue.fechaIngreso,
        turno: formValue.turno,
        almacenAsignado: formValue.almacenAsignado,
        supervisor: formValue.supervisor,
        horario: formValue.horario,
        estado: formValue.estado,
        personaId: formValue.personaId
      };

      const obs$ = this.isEdit && this.depositeroId
        ? this.depositeroService.update(this.depositeroId, depositeroData)
        : this.depositeroService.create(depositeroData);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar depositero:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar el depositero';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un depositero con ese código. Por favor, verifique los datos.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un depositero con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el depositero: ' + error.message;
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        })
      ).subscribe((result) => {
        if (result) {
          // Depositero guardado exitosamente
          this.loading = false;
          this.formEnabled = false;
          this.formGroup.disable();
          this.snackBar.open('Depositero guardado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/deposito']);
        }
      });
    } catch (error) {
      console.error('Error al crear el depositero:', error);
      this.loading = false;
      this.snackBar.open('Error al crear el depositero: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
