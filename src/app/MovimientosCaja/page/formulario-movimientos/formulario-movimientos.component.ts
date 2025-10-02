import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { MovimientoCajaService } from '../../components/movimiento-caja.service';
import { MovimientoCaja } from '../../components/movimiento-caja';

@Component({
  selector: 'app-formulario-movimientos',
  templateUrl: './formulario-movimientos.component.html',
  styleUrls: ['./formulario-movimientos.component.scss']
})
export class FormularioMovimientosComponent implements OnInit, OnDestroy {
  titulo = 'Movimiento de Caja';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  isEdit = false;
  movimientoId: string | null = null;
  loading = false;
  formEnabled = false;

  // Opciones para selects
  tiposMovimiento = [
    { value: 'INGRESO', label: 'Ingreso' },
    { value: 'EGRESO', label: 'Egreso' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private movimientoCajaService: MovimientoCajaService,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.createForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.setupForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      monto: ['', [Validators.required, Validators.min(0.01)]],
      tipo: ['INGRESO', Validators.required],
      descripcion: [''],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      cajaId: ['', Validators.required],
      ventaId: ['']
    });
  }

  private setupForm(): void {
    // Habilitar formulario después de un pequeño delay para evitar errores de detección de cambios
    setTimeout(() => {
      this.formEnabled = true;
    }, 100);
  }

  private checkEditMode(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.movimientoId = id;
        this.titulo = 'Editar Movimiento de Caja';
        this.loadMovimiento(id);
      } else {
        this.isEdit = false;
        this.movimientoId = null;
        this.titulo = 'Nuevo Movimiento de Caja';
      }
    });
  }

  private loadMovimiento(id: string): void {
    this.loading = true;
    this.movimientoCajaService.getById(id).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error al cargar movimiento:', error);
        this.snackBar.open('Error al cargar el movimiento', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/movimientos-caja']);
        return of(null);
      })
    ).subscribe(movimiento => {
      if (movimiento) {
        this.formGroup.patchValue({
          monto: movimiento.monto,
          tipo: movimiento.tipo,
          descripcion: movimiento.descripcion || '',
          fecha: movimiento.fecha ? new Date(movimiento.fecha).toISOString().split('T')[0] : '',
          cajaId: movimiento.caja?.id || '',
          ventaId: movimiento.venta?.id || ''
        });
      }
      this.loading = false;
    });
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.formGroup.value;
    
    // Validaciones adicionales
    if (formValue.monto <= 0) {
      this.snackBar.open('El monto debe ser mayor a 0', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const movimientoData: any = {
        monto: formValue.monto,
        tipo: formValue.tipo,
        descripcion: formValue.descripcion,
        fecha: formValue.fecha,
        cajaId: formValue.cajaId || undefined,
        ventaId: formValue.ventaId || undefined
      };

      const obs$ = this.isEdit && this.movimientoId
        ? this.movimientoCajaService.update(this.movimientoId, movimientoData)
        : this.movimientoCajaService.create(movimientoData);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar movimiento:', error);
          this.loading = false;
          
          let mensajeError = 'Error al guardar el movimiento';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un movimiento con esos datos. Por favor, verifique los datos.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un movimiento con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el movimiento: ' + error.message;
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
          const accion = this.isEdit ? 'actualizado' : 'creado';
          this.snackBar.open(`Movimiento de caja ${accion} exitosamente`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/movimientos-caja']);
        }
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      this.loading = false;
      this.snackBar.open('Error inesperado al procesar el formulario', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/movimientos-caja']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para acceder a los controles del formulario
  get monto() { return this.formGroup.get('monto'); }
  get tipo() { return this.formGroup.get('tipo'); }
  get descripcion() { return this.formGroup.get('descripcion'); }
  get fecha() { return this.formGroup.get('fecha'); }
  get cajaId() { return this.formGroup.get('cajaId'); }
  get ventaId() { return this.formGroup.get('ventaId'); }

  // Métodos de validación
  hasError(controlName: string, errorType: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!(control && control.hasError(errorType) && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.formGroup.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return `El valor mínimo es ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('email')) {
      return 'Ingrese un email válido';
    }
    return '';
  }
}
