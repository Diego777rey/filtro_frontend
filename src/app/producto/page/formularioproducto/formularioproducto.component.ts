import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../../components/producto.service';
import { CategoriaService } from '../../../categoria/components/categoria.service';
import { ProveedorService } from '../../../proveedor/components/proveedor.service';
import { InputProducto } from '../../components/input.producto';
import { Categoria } from '../../../categoria/components/categoria';
import { InputProveedor } from '../../../proveedor/components/input.proveedor';
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
  proveedorSeleccionado: InputProveedor | null = null;
  loading = false;
  formEnabled = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
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
      { control: 'codigoProducto', label: 'Código Producto', tipo: 'text', placeholder: 'Ingrese código', requerido: false },
      { control: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ingrese nombre', requerido: true },
      { control: 'descripcion', label: 'Descripción', tipo: 'text', placeholder: 'Ingrese descripción', requerido: true },
      { control: 'precioCompra', label: 'Precio Compra', tipo: 'number', placeholder: '0.00', requerido: true },
      { control: 'precioVenta', label: 'Precio Venta', tipo: 'number', placeholder: '0.00', requerido: true },
      { control: 'stock', label: 'Stock', tipo: 'number', placeholder: '0', requerido: true },
      { control: 'categoriaId', label: 'Categoría', tipo: 'select', opciones: [], requerido: true },
      { control: 'productoEstado', label: 'Estado Activo', tipo: 'checkbox' }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      const disabled = !this.isEdit; // Habilitar si estamos editando
      this.formGroup.addControl(campo.control, this.fb.control({value: '', disabled: disabled}, validators));
    });
    
    // Agregar control de proveedorId manualmente (usado por el buscador)
    this.formGroup.addControl('proveedorId', this.fb.control({value: '', disabled: !this.isEdit}, [Validators.required]));
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
            label: c.nombre 
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
            codigoProducto: data.codigoProducto,
            nombre: data.nombre,
            descripcion: data.descripcion,
            precioCompra: data.precioCompra,
            precioVenta: data.precioVenta,
            stock: data.stock,
            productoEstado: typeof data.productoEstado === 'string' 
              ? data.productoEstado === 'ACTIVO' 
              : data.productoEstado,
            categoriaId: data.categoria?.id || '',
            proveedorId: data.proveedor?.id || ''
          });
          
          // Establecer la categoría seleccionada para el buscador
          if (data.categoria) {
            this.categoriaSeleccionada = data.categoria;
          }
          
          // Establecer el proveedor seleccionado - convertir a InputProveedor
          if (data.proveedor) {
            this.proveedorSeleccionado = new InputProveedor({
              id: data.proveedor.id,
              ruc: data.proveedor.ruc,
              razonSocial: data.proveedor.razonSocial,
              rubro: data.proveedor.rubro,
              telefono: data.proveedor.telefono,
              email: data.proveedor.email,
              observaciones: data.proveedor.observaciones
            });
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

  // Método para manejar la selección de proveedor
  onProveedorSeleccionado(proveedor: InputProveedor | null): void {
    this.proveedorSeleccionado = proveedor;
    
    if (proveedor) {
      this.formGroup.patchValue({
        proveedorId: proveedor.id
      });
    } else {
      this.formGroup.patchValue({
        proveedorId: null
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
    this.formGroup.reset({ productoEstado: true });
    this.categoriaSeleccionada = null; // Limpiar categoría seleccionada
    this.proveedorSeleccionado = null; // Limpiar proveedor seleccionado
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.categoriaSeleccionada = null; // Limpiar categoría seleccionada
    this.proveedorSeleccionado = null; // Limpiar proveedor seleccionado
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
    
    // Verificar que se haya seleccionado un proveedor
    if (!formValue.proveedorId) {
      this.snackBar.open('Error: Debe seleccionar un proveedor', 'Cerrar', {
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

    // Usar el proveedor seleccionado
    if (!this.proveedorSeleccionado) {
      this.snackBar.open('Error: Debe seleccionar un proveedor', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      // Convertir InputProveedor al formato Proveedor esperado por InputProducto
      const proveedorParaProducto = this.proveedorSeleccionado ? {
        id: this.proveedorSeleccionado.id!,
        ruc: this.proveedorSeleccionado.ruc,
        razonSocial: this.proveedorSeleccionado.razonSocial,
        rubro: this.proveedorSeleccionado.rubro,
        telefono: this.proveedorSeleccionado.telefono,
        email: this.proveedorSeleccionado.email,
        observaciones: this.proveedorSeleccionado.observaciones
      } : undefined;

      const producto = new InputProducto({
        codigoProducto: formValue.codigoProducto,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        precioCompra: Number(formValue.precioCompra),
        precioVenta: Number(formValue.precioVenta),
        stock: Number(formValue.stock),
        productoEstado: formValue.productoEstado,
        categoria: this.categoriaSeleccionada,
        proveedor: proveedorParaProducto
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
