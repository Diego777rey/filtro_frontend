import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../components/categoria.service';
import { Categoria } from '../../components/categoria';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulariocategoria',
  templateUrl: '../../../reutilizacion/formulario-generico/formulario-generico.component.html',
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
    private categoriaService: CategoriaService
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
      { control: 'categoriaEstado', label: 'Estado', tipo: 'select', placeholder: 'Seleccione estado', requerido: true, opciones: [
        { value: 'ACTIVO', label: 'Activo' },
        { value: 'INACTIVO', label: 'Inactivo' }
      ]}
    ];

    // Crear los FormControls
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      this.formGroup.addControl(campo.control, this.fb.control('', validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.categoriaId = Number(id);
      this.loadCategoria(this.categoriaId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
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
            categoriaEstado: data.categoriaEstado
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
  }

  cancelar(): void {
    this.formGroup.reset();
    this.formEnabled = false;
  }

  volver(): void {
    this.router.navigate(['dashboard/categoria']);
  }

  guardar(): void {
    if (this.formGroup.invalid) return;

    const formValue = this.formGroup.value;
    const categoria = new Categoria({
      nombre: formValue.nombre,
      categoriaEstado: formValue.categoriaEstado
    });

    const obs$ = this.isEdit && this.categoriaId
      ? this.categoriaService.update(this.categoriaId, categoria)
      : this.categoriaService.create(categoria);

    this.loading = true;
    obs$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = false;
      this.formEnabled = false;
      this.router.navigate(['dashboard/categoria']);
    });
  }
}
