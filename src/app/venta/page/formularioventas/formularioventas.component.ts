import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { VentaService, Venta, VentaInput, VentaDetalleInput } from '../../components/venta.service';
import { ClienteService } from 'src/app/cliente/components/cliente.service';
import { ProductoService } from 'src/app/producto/components/producto.service';
import { VendedorService } from 'src/app/vendedor/components/vendedor.service';
import { Cliente } from 'src/app/cliente/components/cliente';
import { Vendedor } from 'src/app/vendedor/components/vendedor';
import { Producto } from 'src/app/reutilizacion/buscador-producto/producto.interface';

type ProductoVenta = { productoId?: number; descripcion: string; cantidad: number; precio: number; subtotal: number };

@Component({
  selector: 'app-formularioventas',
  templateUrl: './formularioventas.component.html',
  styleUrls: ['./formularioventas.component.scss']
})
export class FormularioventasComponent implements OnInit, OnDestroy {
  titulo = 'Venta';
  private destroy$ = new Subject<void>();

  ventaForm: FormGroup;
  esEdicion = false;
  ventaId: string | null = null;
  loading = false;
  formEnabled = false;

  clientes: Cliente[] = [];
  vendedores: Vendedor[] = [];
  productos: Producto[] = [];
  productosAgregados: ProductoVenta[] = [];
  totalVenta: number = 0;

  // Variables para los buscadores
  clienteSeleccionado: Cliente | null = null;
  vendedorSeleccionado: Vendedor | null = null;
  productoSeleccionado: Producto | null = null;

  columnasProductos = ['producto', 'precio', 'cantidad', 'subtotal', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private vendedorService: VendedorService,
    private snackBar: MatSnackBar
  ) {
    this.ventaForm = this.fb.group({
      fecha: [new Date(), Validators.required], // Fecha actual por defecto
      tipoPago: ['', Validators.required],
      clienteId: [null, Validators.required],
      vendedorId: [null, Validators.required],
      productoId: [null],
      cantidad: [1, [Validators.required, Validators.min(1)]]
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
    }, 100);
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
          tipoPago: venta.tipoVenta || 'EFECTIVO',
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

    if (this.productoSeleccionado && cantidad > 0) {
      const producto = this.productoSeleccionado;
      const subtotal = producto.precio * cantidad;
      
      // Verificar si el producto ya está agregado
      const productoExistente = this.productosAgregados.find(p => p.productoId === producto.id);
      if (productoExistente) {
        productoExistente.cantidad += cantidad;
        productoExistente.subtotal = productoExistente.precio * productoExistente.cantidad;
      } else {
        const nuevoProducto = {
          productoId: producto.id,
          descripcion: producto.descripcion,
          cantidad: cantidad,
          precio: producto.precio,
          subtotal: subtotal
        };
        this.productosAgregados.push(nuevoProducto);
      }
      
      // Limpiar el formulario de producto
      this.ventaForm.patchValue({ cantidad: 1 });
      this.productoSeleccionado = null;
      
      // Actualizar el total de la venta
      this.actualizarTotal();
    }
  }

  removerProducto(index: number): void {
    this.productosAgregados.splice(index, 1);
    this.actualizarTotal();
  }

  calcularTotal(): number {
    return this.productosAgregados.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  }

  actualizarTotal(): void {
    if (this.productosAgregados && this.productosAgregados.length > 0) {
      this.totalVenta = this.productosAgregados.reduce((total, producto) => {
        const subtotal = producto.subtotal || (producto.precio * producto.cantidad);
        return total + subtotal;
      }, 0);
    } else {
      this.totalVenta = 0;
    }
    // Total y productos actualizados
  }

  guardar(): void {
    if (this.ventaForm.invalid) {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.productosAgregados.length === 0) {
      this.snackBar.open('Debe agregar al menos un producto', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.ventaForm.value;
    const { productoId, cantidad, ...ventaFormData } = formValue;
    
    try {
      const ventaData: VentaInput = {
        fechaVenta: ventaFormData.fecha.toISOString(),
        tipoVenta: ventaFormData.tipoPago,
        clienteId: this.clienteSeleccionado?.id || 0,
        vendedorId: this.vendedorSeleccionado?.id || 0,
        cajeroId: 1, // TODO: Obtener del contexto de sesión
        cajaId: 1, // TODO: Obtener del contexto de sesión
        total: this.totalVenta,
        detalles: this.productosAgregados.map(producto => ({
          productoId: producto.productoId || 0,
          cantidad: Number(producto.cantidad),
          precioUnitario: Number(producto.precio),
          descuento: 0,
          subtotal: Number(producto.subtotal)
        }))
      };

      const obs$ = this.esEdicion && this.ventaId
        ? this.ventaService.update(this.ventaId, ventaData)
        : this.ventaService.create(ventaData);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar venta:', error);
          this.loading = false;
          
          let mensajeError = 'Error al guardar la venta';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe una venta con esos datos. Por favor, verifique los datos.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe una venta con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar la venta: ' + error.message;
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
          const accion = this.esEdicion ? 'actualizada' : 'creada';
          this.snackBar.open(`Venta ${accion} exitosamente`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/ventas']);
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
  get tipoPago() { return this.ventaForm.get('tipoPago'); }
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
    // Resetear formulario con fecha actual
    this.ventaForm.reset({
      fecha: new Date(), // Fecha actual por defecto
      cantidad: 1
    });
    this.productosAgregados = [];
    this.totalVenta = 0;
    this.clienteSeleccionado = null;
    this.vendedorSeleccionado = null;
    this.productoSeleccionado = null;
  }
}
