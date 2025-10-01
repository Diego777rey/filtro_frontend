import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriaService } from '../../components/categoria.service';
import { Categoria } from '../../components/categoria';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulariocategoria',
  templateUrl: './formulariocategoria.component.html',
  styleUrls: ['./formulariocategoria.component.scss']
})
export class FormulariocategoriaComponent implements OnInit, OnDestroy {
  titulo = 'Categoría';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoFormulario[] = [];
  isEdit = false;
  categoriaId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoriaService: CategoriaService,
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
      { control: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ingrese nombre de la categoría', requerido: true },
      { control: 'categoriaEstado', label: 'Estado Activo', tipo: 'checkbox' }
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
      this.categoriaId = Number(id);
      this.loadCategoria(this.categoriaId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadCategoria(id: number): void {
    this.loading = true;
    this.categoriaService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Categoria | null) => {
        if (data) {
          this.formGroup.patchValue({
            nombre: data.nombre,
            categoriaEstado: data.categoriaEstado === 'ACTIVO'
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
      categoriaEstado: true 
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
    this.router.navigate(['dashboard/categoria']);
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

    // Validación básica de nombre
    const formValue = this.formGroup.value;
    if (!formValue.nombre || formValue.nombre.trim().length === 0) {
      this.snackBar.open('Error: El nombre es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const categoria = new Categoria({
        nombre: formValue.nombre,
        categoriaEstado: formValue.categoriaEstado ? 'ACTIVO' : 'INACTIVO'
      });

      const obs$ = this.isEdit && this.categoriaId
        ? this.categoriaService.update(this.categoriaId, categoria)
        : this.categoriaService.create(categoria);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar categoría:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar la categoría';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe una categoría con ese nombre. Por favor, usa un nombre diferente.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe una categoría con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar la categoría: ' + error.message;
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
          this.snackBar.open('Categoría guardada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/categoria']);
        }
      });
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      this.loading = false;
      this.snackBar.open('Error al crear la categoría: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
