import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProveedorService } from '../../components/proveedor.service';
import { InputProveedor } from '../../components/input.proveedor';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulario-proveedor',
  templateUrl: './formulario-proveedor.component.html',
  styleUrls: ['./formulario-proveedor.component.scss']
})
export class FormularioProveedorComponent implements OnInit, OnDestroy {
  titulo = 'Proveedor';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoFormulario[] = [];
  isEdit = false;
  proveedorId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private proveedorService: ProveedorService,
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
      { control: 'ruc', label: 'RUC', tipo: 'text', placeholder: 'Ingrese RUC', requerido: true },
      { control: 'razonSocial', label: 'Razón Social', tipo: 'text', placeholder: 'Ingrese razón social', requerido: true },
      { control: 'rubro', label: 'Rubro', tipo: 'text', placeholder: 'Ingrese rubro', requerido: false },
      { control: 'telefono', label: 'Teléfono', tipo: 'text', placeholder: 'Ingrese teléfono', requerido: false },
      { control: 'email', label: 'Email', tipo: 'text', placeholder: 'Ingrese email', requerido: false },
      { control: 'observaciones', label: 'Observaciones', tipo: 'text', placeholder: 'Ingrese observaciones', requerido: false }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      if (campo.control === 'email') {
        validators.push(Validators.email);
      }
      const disabled = !this.isEdit; // Habilitar si estamos editando
      this.formGroup.addControl(campo.control, this.fb.control({value: '', disabled: disabled}, validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.proveedorId = Number(id);
      this.loadProveedor(this.proveedorId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadProveedor(id: number): void {
    this.loading = true;
    this.proveedorService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: InputProveedor | null) => {
        if (data) {
          this.formGroup.patchValue({
            ruc: data.ruc,
            razonSocial: data.razonSocial,
            rubro: data.rubro,
            telefono: data.telefono,
            email: data.email,
            observaciones: data.observaciones
          });
        }
        this.loading = false;
      });
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset();
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.formEnabled = false;
    this.formGroup.disable();
  }

  volver(): void {
    this.router.navigate(['dashboard/proveedor']);
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

    // Validación básica de RUC
    const formValue = this.formGroup.value;
    if (!formValue.ruc || formValue.ruc.trim().length === 0) {
      this.snackBar.open('Error: El RUC es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Validación básica de razón social
    if (!formValue.razonSocial || formValue.razonSocial.trim().length === 0) {
      this.snackBar.open('Error: La razón social es obligatoria', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const proveedor = new InputProveedor({
        ruc: formValue.ruc,
        razonSocial: formValue.razonSocial,
        rubro: formValue.rubro,
        telefono: formValue.telefono,
        email: formValue.email,
        observaciones: formValue.observaciones
      });

      const proveedorDto = proveedor.toDto();

      const obs$ = this.isEdit && this.proveedorId
        ? this.proveedorService.update(this.proveedorId, proveedorDto)
        : this.proveedorService.create(proveedorDto);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar proveedor:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar el proveedor';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un proveedor con ese RUC. Por favor, usa un RUC diferente.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un proveedor con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el proveedor: ' + error.message;
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
          this.snackBar.open('Proveedor guardado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/proveedor']);
        }
      });
    } catch (error) {
      console.error('Error al crear el proveedor:', error);
      this.loading = false;
      this.snackBar.open('Error al crear el proveedor: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
