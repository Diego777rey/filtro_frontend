import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VendedorService } from '../../components/vendedor.service';
import { Vendedor } from '../../components/vendedor';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoVendedorFormulario } from './campo-vendedor.formulario';

@Component({
  selector: 'app-formulariovendedor',
  templateUrl: './formulariovendedor.component.html',
  styleUrls: ['./formulariovendedor.component.scss']
})
export class FormulariovendedorComponent implements OnInit, OnDestroy {
  titulo = 'Vendedor';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoVendedorFormulario[] = [];
  isEdit = false;
  vendedorId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vendedorService: VendedorService,
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
      { control: 'codigoVendedor', label: 'Código Vendedor', tipo: 'text', placeholder: 'Ingrese código vendedor', requerido: true },
      { control: 'comision', label: 'Comisión', tipo: 'number', placeholder: 'Ingrese comisión', requerido: true },
      { control: 'sucursal', label: 'Sucursal', tipo: 'text', placeholder: 'Ingrese sucursal', requerido: true },
      { control: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ingrese nombre', requerido: true },
      { control: 'apellido', label: 'Apellido', tipo: 'text', placeholder: 'Ingrese apellido', requerido: true },
      { control: 'documento', label: 'Documento', tipo: 'text', placeholder: 'Ingrese documento', requerido: true },
      { control: 'telefono', label: 'Teléfono', tipo: 'text', placeholder: 'Ingrese teléfono', requerido: true },
      { control: 'email', label: 'Email', tipo: 'text', placeholder: 'ejemplo@correo.com', requerido: true },
      { control: 'direccion', label: 'Dirección', tipo: 'text', placeholder: 'Ingrese dirección', requerido: false },
      { control: 'fechaNacimiento', label: 'Fecha de Nacimiento', tipo: 'date', placeholder: 'Seleccione fecha', requerido: false }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      if (campo.control === 'email') {
        validators.push(Validators.email);
      }
      const disabled = !this.isEdit; // Habilitar si estamos editando
      
      // Establecer valor por defecto para fechaNacimiento
      let defaultValue: any = '';
      if (campo.control === 'fechaNacimiento') {
        defaultValue = new Date(); // Fecha actual
      }
      
      this.formGroup.addControl(campo.control, this.fb.control({value: defaultValue, disabled: disabled}, validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.vendedorId = Number(id);
      this.loadVendedor(this.vendedorId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadVendedor(id: number): void {
    this.loading = true;
    this.vendedorService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Vendedor | null) => {
        if (data) {
          this.formGroup.patchValue({
            codigoVendedor: data.codigoVendedor,
            comision: data.comision,
            sucursal: data.sucursal,
            nombre: data.persona.nombre,
            apellido: data.persona.apellido,
            documento: data.persona.documento,
            telefono: data.persona.telefono,
            email: data.persona.email,
            direccion: data.persona.direccion,
            fechaNacimiento: data.persona.fechaNacimiento
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
      activo: true,
      fechaNacimiento: new Date() // Establecer fecha actual por defecto
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
    this.router.navigate(['dashboard/vendedor']);
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
    if (!formValue.nombre || formValue.nombre.trim().length === 0) {
      this.snackBar.open('Error: El nombre es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.apellido || formValue.apellido.trim().length === 0) {
      this.snackBar.open('Error: El apellido es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.email || formValue.email.trim().length === 0) {
      this.snackBar.open('Error: El email es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const vendedorData = {
        codigoVendedor: formValue.codigoVendedor,
        comision: formValue.comision,
        sucursal: formValue.sucursal,
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        documento: formValue.documento,
        telefono: formValue.telefono,
        email: formValue.email,
        direccion: formValue.direccion,
        fechaNacimiento: formValue.fechaNacimiento,
        estadoPersona: 'ACTIVO'
      };

      const obs$ = this.isEdit && this.vendedorId
        ? this.vendedorService.updateVendedorWithPersona(this.vendedorId, vendedorData)
        : this.vendedorService.createVendedorWithPersona(vendedorData);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar vendedor:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar el vendedor';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un vendedor con ese documento o email. Por favor, verifique los datos.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un vendedor con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el vendedor: ' + error.message;
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        })
      ).subscribe((result) => {
        if (result) {
          // Vendedor guardado exitosamente
          this.loading = false;
          this.formEnabled = false;
          this.formGroup.disable();
          this.snackBar.open('Vendedor guardado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/vendedor']);
        }
      });
    } catch (error) {
      console.error('Error al crear el vendedor:', error);
      this.loading = false;
      this.snackBar.open('Error al crear el vendedor: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
