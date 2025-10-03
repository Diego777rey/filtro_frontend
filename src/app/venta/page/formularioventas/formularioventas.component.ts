import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, of, Observable } from 'rxjs';

import { VentaService, Venta, VentaInput, VentaDetalleInput } from '../../components/venta.service';
import { ClienteService } from 'src/app/cliente/components/cliente.service';
import { ProductoService } from 'src/app/producto/components/producto.service';
import { VendedorService } from 'src/app/vendedor/components/vendedor.service';
import { Cliente } from 'src/app/cliente/components/cliente';
import { Vendedor } from 'src/app/vendedor/components/vendedor';
import { Producto } from 'src/app/reutilizacion/buscador-producto/producto.interface';

type ProductoVenta = { 
  productoId?: number; 
  descripcion: string; 
  cantidad: number; 
  precio: number; 
  subtotal: number; 
};

// Constantes para evitar valores mágicos
const CONSTANTS = {
  CAJERO_DEFAULT: 1,
  CAJA_DEFAULT: 1,
  CANTIDAD_DEFAULT: 1,
  SNACKBAR_DURATION: 3000,
  ERROR_SNACKBAR_DURATION: 7000,
  FORM_ENABLE_DELAY: 100
} as const;

@Component({
  selector: 'app-formularioventas',
  templateUrl: './formularioventas.component.html',
  styleUrls: ['./formularioventas.component.scss']
})
export class FormularioventasComponent implements OnInit, OnDestroy {
  titulo = 'Venta';
  private readonly destroy$ = new Subject<void>();

  ventaForm: FormGroup;
  esEdicion = false;
  ventaId: string | null = null;
  loading = false;
  formEnabled = false;

  // Variables para los buscadores
  clienteSeleccionado: Cliente | null = null;
  vendedorSeleccionado: Vendedor | null = null;
  productoSeleccionado: Producto | null = null;

  productosAgregados: ProductoVenta[] = [];
  totalVenta = 0;

  readonly columnasProductos = ['producto', 'precio', 'cantidad', 'subtotal', 'acciones'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ventaService: VentaService,
    private readonly clienteService: ClienteService,
    private readonly productoService: ProductoService,
    private readonly vendedorService: VendedorService,
    private readonly snackBar: MatSnackBar
  ) {
    this.ventaForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fecha: [new Date(), Validators.required],
      tipoVenta: ['LOCAL', Validators.required],
      clienteId: [null, Validators.required],
      vendedorId: [null, Validators.required],
      productoId: [null],
      cantidad: [CONSTANTS.CANTIDAD_DEFAULT, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.setupForm();
    this.cargarDatos();
    this.actualizarTotal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupForm(): void {
    setTimeout(() => {
      this.formEnabled = true;
    }, CONSTANTS.FORM_ENABLE_DELAY);
  }

  private checkEditMode(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.ventaId = id;
        this.titulo = 'Editar Venta';
        this.loadVenta(id);
      } else {
        this.esEdicion = false;
        this.ventaId = null;
        this.titulo = 'Nueva Venta';
      }
    });
  }

  private cargarDatos(): void {
    // Los datos se cargan dinámicamente a través de los buscadores
    // No necesitamos cargar todos los datos al inicio para mejor rendimiento
  }

  private loadVenta(id: string): void {
    this.loading = true;
    this.ventaService.getById(id).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error al cargar venta:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar la venta', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/ventas']);
        return of(null);
      })
    ).subscribe(venta => {
      if (venta) {
        this.ventaForm.patchValue({
          fecha: venta.fechaVenta ? new Date(venta.fechaVenta) : new Date(),
          tipoVenta: venta.tipoVenta || 'LOCAL',
          clienteId: venta.cliente?.id,
          vendedorId: venta.vendedor?.id
        });

        // Cargar los objetos completos para los buscadores
        if (venta.cliente) {
          this.clienteSeleccionado = venta.cliente as any;
        }
        if (venta.vendedor) {
          this.vendedorSeleccionado = venta.vendedor as any;
        }

        // Convert detalles to productosAgregados format
        this.productosAgregados = (venta.detalles || []).map((detalle: any) => ({
          productoId: detalle.producto?.id,
          descripcion: detalle.producto?.nombre || detalle.producto?.descripcion || '',
          cantidad: detalle.cantidad,
          precio: detalle.precioUnitario,
          subtotal: detalle.subtotal || (detalle.cantidad * detalle.precioUnitario)
        }));
        
        // Actualizar el total de la venta
        this.actualizarTotal();
      }
      this.loading = false;
    });
  }

  // Métodos para manejar las selecciones de los buscadores
  onClienteSeleccionado(cliente: Cliente | null): void {
    this.clienteSeleccionado = cliente;
    if (cliente) {
      this.ventaForm.patchValue({ clienteId: cliente.id });
    } else {
      this.ventaForm.patchValue({ clienteId: null });
    }
  }

  onVendedorSeleccionado(vendedor: Vendedor | null): void {
    this.vendedorSeleccionado = vendedor;
    if (vendedor) {
      this.ventaForm.patchValue({ vendedorId: vendedor.id });
    } else {
      this.ventaForm.patchValue({ vendedorId: null });
    }
  }

  onProductoSeleccionado(producto: Producto | null): void {
    this.productoSeleccionado = producto;
    if (producto) {
      this.ventaForm.patchValue({ productoId: producto.id });
    } else {
      this.ventaForm.patchValue({ productoId: null });
    }
  }

  agregarProducto(): void {
    const cantidad = this.ventaForm.get('cantidad')?.value;

    if (!this.productoSeleccionado || cantidad <= 0) {
      return;
    }

    this.addOrUpdateProduct(this.productoSeleccionado, cantidad);
    this.clearProductForm();
    this.actualizarTotal();
  }

  private addOrUpdateProduct(producto: Producto, cantidad: number): void {
    const productoExistente = this.productosAgregados.find(p => p.productoId === producto.id);
    
    if (productoExistente) {
      this.updateExistingProduct(productoExistente, cantidad);
    } else {
      this.addNewProduct(producto, cantidad);
    }
  }

  private updateExistingProduct(producto: ProductoVenta, cantidad: number): void {
    producto.cantidad += cantidad;
    producto.subtotal = producto.precio * producto.cantidad;
  }

  private addNewProduct(producto: Producto, cantidad: number): void {
    const nuevoProducto: ProductoVenta = {
      productoId: producto.id,
      descripcion: producto.descripcion,
      cantidad,
      precio: producto.precio,
      subtotal: producto.precio * cantidad
    };
    this.productosAgregados.push(nuevoProducto);
  }

  private clearProductForm(): void {
    this.ventaForm.patchValue({ cantidad: CONSTANTS.CANTIDAD_DEFAULT });
    this.productoSeleccionado = null;
  }

  removerProducto(index: number): void {
    this.productosAgregados.splice(index, 1);
    this.actualizarTotal();
  }

  private calcularTotal(): number {
    return this.productosAgregados.reduce((total, producto) => {
      const subtotal = producto.subtotal || (producto.precio * producto.cantidad);
      return total + subtotal;
    }, 0);
  }

  private actualizarTotal(): void {
    this.totalVenta = this.productosAgregados.length > 0 ? this.calcularTotal() : 0;
  }

  guardar(): void {
    if (!this.validateForm()) {
      return;
    }

    const ventaData = this.buildVentaData();
    const operation$ = this.esEdicion && this.ventaId
      ? this.ventaService.update(this.ventaId, ventaData)
      : this.ventaService.create(ventaData);

    this.executeOperation(operation$);
  }

  private validateForm(): boolean {
    if (this.ventaForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Por favor, complete todos los campos requeridos');
      return false;
    }

    if (this.productosAgregados.length === 0) {
      this.showError('Debe agregar al menos un producto');
      return false;
    }

    return true;
  }

  private buildVentaData(): VentaInput {
    const formValue = this.ventaForm.value;
    const { productoId, cantidad, ...ventaFormData } = formValue;
    
    return {
      clienteId: String(this.clienteSeleccionado?.id || 0),
      vendedorId: String(this.vendedorSeleccionado?.id || 0),
      cajeroId: String(CONSTANTS.CAJERO_DEFAULT),
      cajaId: String(CONSTANTS.CAJA_DEFAULT),
      tipoVenta: ventaFormData.tipoVenta,
      detalles: this.productosAgregados.map(producto => ({
        productoId: String(producto.productoId || 0),
        cantidad: Number(producto.cantidad)
      }))
    };
  }

  private executeOperation(operation$: Observable<Venta>): void {
    this.loading = true;
    operation$.pipe(
      takeUntil(this.destroy$),
      catchError(this.handleError.bind(this))
    ).subscribe((result: Venta | null) => {
      if (result) {
        this.handleSuccess();
      }
    });
  }

  private handleError = (error: any): Observable<null> => {
    console.error('Error al guardar venta:', error);
    this.loading = false;
    
    const errorMessage = this.getApiErrorMessage(error);
    this.showError(errorMessage, CONSTANTS.ERROR_SNACKBAR_DURATION);
    
    return of(null);
  };

  private getApiErrorMessage(error: any): string {
    if (error.message?.includes('llave duplicada')) {
      return 'Ya existe una venta con esos datos. Por favor, verifique los datos.';
    }
    if (error.message?.includes('constraint')) {
      return 'Error de validación: Ya existe una venta con esos datos.';
    }
    if (error.message) {
      return `Error al guardar la venta: ${error.message}`;
    }
    return 'Error al guardar la venta';
  }

  private handleSuccess(): void {
    this.loading = false;
    const accion = this.esEdicion ? 'actualizada' : 'creada';
    this.showSuccess(`Venta ${accion} exitosamente`);
    this.router.navigate(['/dashboard/ventas']);
  }

  private showError(message: string, duration: number = CONSTANTS.SNACKBAR_DURATION): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: CONSTANTS.SNACKBAR_DURATION,
      panelClass: ['success-snackbar']
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/ventas']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ventaForm.controls).forEach(key => {
      const control = this.ventaForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para acceder a los controles del formulario
  get fecha() { return this.ventaForm.get('fecha'); }
  get tipoVenta() { return this.ventaForm.get('tipoVenta'); }
  get clienteId() { return this.ventaForm.get('clienteId'); }
  get vendedorId() { return this.ventaForm.get('vendedorId'); }
  get cantidad() { return this.ventaForm.get('cantidad'); }

  // Métodos de validación
  hasError(controlName: string, errorType: string): boolean {
    const control = this.ventaForm.get(controlName);
    return !!(control && control.hasError(errorType) && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.ventaForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return `El valor mínimo es ${control.errors?.['min'].min}`;
    }
    return '';
  }

  nuevo(): void {
    this.resetForm();
    this.clearSelections();
    this.clearProducts();
  }

  private resetForm(): void {
    this.ventaForm.reset({
      fecha: new Date(),
      cantidad: CONSTANTS.CANTIDAD_DEFAULT
    });
  }

  private clearSelections(): void {
    this.clienteSeleccionado = null;
    this.vendedorSeleccionado = null;
    this.productoSeleccionado = null;
  }

  private clearProducts(): void {
    this.productosAgregados = [];
    this.totalVenta = 0;
  }
}
