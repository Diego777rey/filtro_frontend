import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductoService } from 'src/app/producto/components/producto.service';
import { Producto } from './producto.interface';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador-producto',
  templateUrl: './buscador-producto.component.html',
  styleUrls: ['./buscador-producto.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class BuscadorProductoComponent implements OnInit, OnDestroy {
  @Input() productoSeleccionado: Producto | null = null;
  @Input() placeholder: string = 'Seleccionar producto';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Producto';
  @Input() showPrecio: boolean = true;
  @Input() showStock: boolean = true;
  @Input() showCategoria: boolean = true;
  
  @Output() productoSeleccionadoChange = new EventEmitter<Producto | null>();
  @Output() modalAbiertoChange = new EventEmitter<boolean>();

  @ViewChild('modalTemplate', { static: false }) modalTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = false;
  filtroBusqueda = '';
  filtroControl = new FormControl('');

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.setupFiltroDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroControl.setValue('', { emitEvent: false });
  }

  private cargarProductos(): void {
    this.loading = true;
    this.productoService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar productos:', error);
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.productos = (data || []).map(p => ({
          id: p.id,
          descripcion: p.descripcion,
          precio: p.precioVenta || p.precio || 0,
          stock: p.stock || 0,
          categoriaId: p.categoriaId || 0,
          categoria: p.categoria ? { id: p.categoria.id, nombre: p.categoria.nombre } : undefined,
          codigo: p.codigo || '',
          activo: p.activo !== false,
          fechaCreacion: new Date()
        }));
        this.productosFiltrados = [...this.productos];
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private setupFiltroDebounce(): void {
    this.filtroControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.filtroBusqueda = value || '';
        this.filtrarEnTiempoReal();
      });
  }

  abrirModal(): void {
    if (this.disabled || this.loading) return;
    
    const dialogRef = this.dialog.open(this.modalTemplate, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '80vh',
      disableClose: false,
      autoFocus: false
    });

    this.modalAbiertoChange.emit(true);
    
    // Resetear filtro al abrir el modal
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.productosFiltrados = [...this.productos];
    this.cdr.markForCheck();

    dialogRef.afterClosed().subscribe(() => {
      this.modalAbiertoChange.emit(false);
    });
  }

  cerrarModal(): void {
    this.dialog.closeAll();
  }

  filtrarEnTiempoReal(): void {
    if (!this.filtroBusqueda.trim()) {
      this.productosFiltrados = [...this.productos];
    } else {
      const filtro = this.filtroBusqueda.toLowerCase().trim();
      this.productosFiltrados = this.productos.filter(producto => 
        this.coincideFiltro(producto, filtro)
      );
    }
    this.cdr.markForCheck();
  }

  private coincideFiltro(producto: Producto, filtro: string): boolean {
    const descripcionMatch = producto.descripcion?.toLowerCase().includes(filtro) || false;
    const categoriaMatch = producto.categoria?.nombre?.toLowerCase().includes(filtro) || false;
    const codigoMatch = producto.codigo?.toLowerCase().includes(filtro) || false;
    const precioMatch = producto.precio?.toString().includes(filtro) || false;
    
    return descripcionMatch || categoriaMatch || codigoMatch || precioMatch;
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.filtrarEnTiempoReal();
  }

  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.productoSeleccionadoChange.emit(producto);
    this.cerrarModal();
  }

  limpiarSeleccion(): void {
    this.productoSeleccionado = null;
    this.productoSeleccionadoChange.emit(null);
  }

  getDisplayText(): string {
    if (!this.productoSeleccionado) {
      return this.placeholder;
    }
    return this.productoSeleccionado.descripcion;
  }

  esProductoSeleccionado(producto: Producto): boolean {
    return this.productoSeleccionado?.id === producto.id;
  }

  trackByProducto(index: number, producto: Producto): any {
    return producto.id || index;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  }
}
