import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SucursalService } from '../../components/sucursal.service';
import { Sucursal } from '../../components/sucursal';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulariosucursal',
  templateUrl: './formulariosucursal.component.html',
  styleUrls: ['./formulariosucursal.component.scss']
})
export class FormulariosucursalComponent implements OnInit, OnDestroy {
  titulo = 'Sucursal';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoFormulario[] = [];
  isEdit = false;
  sucursalId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sucursalService: SucursalService,
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
      { control: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ingrese nombre de la sucursal', requerido: true },
      { control: 'pais', label: 'Pais', tipo: 'text', placeholder: 'Ingrese pais de la sucursal', requerido: true },
      { control: 'departamento', label: 'Departamento', tipo: 'text', placeholder: 'Ingrese el departamento de la sucursal', requerido: true },
      { control: 'ciudad', label: 'Ciudad', tipo: 'text', placeholder: 'Ingrese la ciudad de la sucursal', requerido: true },
      { control: 'direccion', label: 'Dirección', tipo: 'text', placeholder: 'Ingrese dirección de la sucursal', requerido: true },
      { control: 'telefono', label: 'Teléfono', tipo: 'text', placeholder: 'Ingrese teléfono de la sucursal', requerido: true }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      const disabled = !this.isEdit; // Habilitar si estamos editando
      
      this.formGroup.addControl(campo.control, this.fb.control({value: '', disabled: disabled}, validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.sucursalId = Number(id);
      this.loadSucursal(this.sucursalId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadSucursal(id: number): void {
    this.loading = true;
    this.sucursalService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Sucursal | null) => {
        if (data) {
          this.formGroup.patchValue({
            nombre: data.nombre,
            pais: data.pais || '',
            departamento: data.departamento || '',
            ciudad: data.ciudad || '',
            direccion: data.direccion,
            telefono: data.telefono
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
      nombre: '',
      pais: '',
      departamento: '',
      ciudad: '',
      direccion: '',
      telefono: ''
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
    this.router.navigate(['dashboard/sucursal']);
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

    // Validación básica de campos
    const formValue = this.formGroup.value;
    if (!formValue.nombre || formValue.nombre.trim().length === 0) {
      this.snackBar.open('Error: El nombre es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.pais || formValue.pais.trim().length === 0) {
      this.snackBar.open('Error: El país es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.departamento || formValue.departamento.trim().length === 0) {
      this.snackBar.open('Error: El departamento es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.ciudad || formValue.ciudad.trim().length === 0) {
      this.snackBar.open('Error: La ciudad es obligatoria', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.direccion || formValue.direccion.trim().length === 0) {
      this.snackBar.open('Error: La dirección es obligatoria', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.telefono || formValue.telefono.trim().length === 0) {
      this.snackBar.open('Error: El teléfono es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const sucursal = new Sucursal({
        nombre: formValue.nombre,
        pais: formValue.pais,
        departamento: formValue.departamento,
        ciudad: formValue.ciudad,
        direccion: formValue.direccion,
        telefono: formValue.telefono
      });

      const obs$ = this.isEdit && this.sucursalId
        ? this.sucursalService.update(this.sucursalId, sucursal)
        : this.sucursalService.create(sucursal);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar sucursal:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar la sucursal';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe una sucursal con ese nombre. Por favor, usa un nombre diferente.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe una sucursal con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar la sucursal: ' + error.message;
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
          this.snackBar.open('Sucursal guardada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/sucursal']);
        }
      });
    } catch (error) {
      console.error('Error al crear la sucursal:', error);
      this.loading = false;
      this.snackBar.open('Error al crear la sucursal: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
