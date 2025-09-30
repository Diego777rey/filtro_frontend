import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VendedorService } from '../../components/vendedor.service';
import { Vendedor } from '../../components/vendedor';
import { Persona } from '../../components/vendedor';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-formulariovendedor',
  templateUrl: './formulariovendedor.component.html',
  styleUrls: ['./formulariovendedor.component.scss']
})
export class FormulariovendedorComponent implements OnInit, OnDestroy {
  titulo = 'Vendedor';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  isEdit = false;
  vendedorId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs
  personaSeleccionada: Persona | null = null;

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
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    // Solo campos específicos de vendedor según el esquema GraphQL
    this.formGroup = this.fb.group({
      codigoVendedor: [{value: '', disabled: !this.isEdit}, [Validators.required]],
      comision: [{value: '', disabled: !this.isEdit}, [Validators.required]],
      sucursal: [{value: '', disabled: !this.isEdit}, [Validators.required]]
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
            sucursal: data.sucursal
          });
          // Establecer la persona seleccionada
          this.personaSeleccionada = data.persona;
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
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.personaSeleccionada = null;
    this.formEnabled = false;
    this.formGroup.disable();
  }

  volver(): void {
    this.router.navigate(['dashboard/vendedor']);
  }

  // Método para manejar la selección de persona
  onPersonaSeleccionada(persona: Persona | null): void {
    this.personaSeleccionada = persona;
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

    // Validación de persona seleccionada
    if (!this.personaSeleccionada) {
      this.snackBar.open('Error: Debe seleccionar una persona', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const formValue = this.formGroup.value;
      const vendedorData = {
        codigoVendedor: formValue.codigoVendedor,
        comision: formValue.comision,
        sucursal: formValue.sucursal,
        persona: this.personaSeleccionada
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
