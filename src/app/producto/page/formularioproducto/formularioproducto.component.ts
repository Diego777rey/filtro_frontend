import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../../components/producto.service';
import { CategoriaService } from '../../../categoria/components/categoria.service';
import { InputProducto } from '../../components/input.producto';
import { Categoria } from '../../../categoria/components/categoria';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulario-producto',
  templateUrl: './formularioproducto.component.html',
  styleUrls: ['./formularioproducto.component.scss']
})
export class ProductoFormComponent implements OnInit, OnDestroy {
  titulo = 'Producto';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoFormulario[] = [];
  isEdit = false;
  productoId: number | null = null;
  categorias: Categoria[] = [];
  categoriaSeleccionada: Categoria | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
    this.initCampos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCampos(): void {
    this.campos = [
      { control: 'descripcion', label: 'Descripción', tipo: 'text', placeholder: 'Ingrese descripción', requerido: true },
      { control: 'precioCompra', label: 'Precio Compra', tipo: 'number', placeholder: '0.00', requerido: true },
      { control: 'precioVenta', label: 'Precio Venta', tipo: 'number', placeholder: '0.00', requerido: true },
      { control: 'stock', label: 'Stock', tipo: 'number', placeholder: '0', requerido: true },
      { control: 'categoriaId', label: 'Categoría', tipo: 'select', opciones: [], requerido: true },
      { control: 'activo', label: 'Activo', tipo: 'checkbox' }
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
      this.productoId = Number(id);
      this.loadProduct(this.productoId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadCategories(): void {
    this.loading = true;
    this.categoriaService.getAll()
      .pipe(takeUntil(this.destroy$), catchError((error) => {
        console.error('Error al cargar categorías:', error);
        return of([]);
      }))
      .subscribe(data => {
        this.categorias = data || [];
        
        // Actualizar opciones del select
        const categoriaCampo = this.campos.find(c => c.control === 'categoriaId');
        if (categoriaCampo) {
          categoriaCampo.opciones = this.categorias.map(c => ({ 
            value: c.id, 
            label: c.descripcion 
          }));
        }
        this.loading = false;
      });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productoService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: InputProducto | null) => {
        if (data) {
          this.formGroup.patchValue({
            descripcion: data.descripcion,
            precioCompra: data.precioCompra,
            precioVenta: data.precioVenta,
            stock: data.stock,
            activo: data.activo,
            categoriaId: data.categoria?.id || ''
          });
          
          // Establecer la categoría seleccionada para el buscador
          if (data.categoria) {
            this.categoriaSeleccionada = data.categoria;
          }
        }
        this.loading = false;
      });
  }

  // Método para manejar la selección de categoría desde el buscador
  onCategoriaSeleccionada(categoria: Categoria | null): void {
    this.categoriaSeleccionada = categoria;
    
    if (categoria) {
      this.formGroup.patchValue({
        categoriaId: categoria.id
      });
    } else {
      this.formGroup.patchValue({
        categoriaId: null
      });
    }
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    // Asegurar que las categorías estén cargadas antes de habilitar el formulario
    if (this.categorias.length === 0) {
      this.loadCategories();
    }
    this.formGroup.reset({ activo: true });
    this.categoriaSeleccionada = null; // Limpiar categoría seleccionada
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.categoriaSeleccionada = null; // Limpiar categoría seleccionada
    this.formEnabled = false;
    this.formGroup.disable();
  }

  volver(): void {
    this.router.navigate(['dashboard/producto']);
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

    // Verificar si las categorías se han cargado
    if (this.categorias.length === 0) {
      this.snackBar.open('Error: No hay categorías disponibles. Por favor, recarga la página.', 'Cerrar', {
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
    
    // Verificar que se haya seleccionado una categoría
    if (!formValue.categoriaId) {
      this.snackBar.open('Error: Debe seleccionar una categoría', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Usar la categoría seleccionada del buscador
    if (!this.categoriaSeleccionada) {
      this.snackBar.open('Error: Debe seleccionar una categoría', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const producto = new InputProducto({
        descripcion: formValue.descripcion,
        precioCompra: Number(formValue.precioCompra),
        precioVenta: Number(formValue.precioVenta),
        stock: Number(formValue.stock),
        activo: formValue.activo,
        categoria: this.categoriaSeleccionada
      });

      const productoDto = producto.toDto();

      const obs$ = this.isEdit && this.productoId
        ? this.productoService.update(this.productoId, productoDto)
        : this.productoService.create(productoDto);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar producto:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar el producto';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un producto con esa descripción. Por favor, usa una descripción diferente.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un producto con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el producto: ' + error.message;
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
          this.snackBar.open('Producto guardado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/producto']);
        }
      });
    } catch (error) {
      console.error('Error al crear el producto:', error);
      this.loading = false;
      this.snackBar.open('Error al crear el producto: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
