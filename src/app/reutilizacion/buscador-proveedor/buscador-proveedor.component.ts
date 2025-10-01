import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProveedorService } from '../../proveedor/components/proveedor.service';
import { InputProveedor } from '../../proveedor/components/input.proveedor';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador-proveedor',
  templateUrl: './buscador-proveedor.component.html',
  styleUrls: ['./buscador-proveedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuscadorProveedorComponent implements OnInit, OnDestroy {
  @Input() proveedorSeleccionado: InputProveedor | null = null;
  @Input() placeholder: string = 'Seleccionar proveedor';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Proveedor';
  @Input() showEmail: boolean = true;
  
  @Output() proveedorSeleccionadoChange = new EventEmitter<InputProveedor | null>();
  @Output() modalAbiertoChange = new EventEmitter<boolean>();

  @ViewChild('modalTemplate', { static: false }) modalTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  
  proveedores: InputProveedor[] = [];
  proveedoresFiltrados: InputProveedor[] = [];
  loading = false;
  filtroBusqueda = '';
  filtroControl = new FormControl('');

  constructor(
    private proveedorService: ProveedorService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
    this.setupFiltroDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroControl.setValue('', { emitEvent: false });
  }

  private cargarProveedores(): void {
    this.loading = true;
    this.proveedorService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar proveedores:', error);
          return of([]);
        })
      )
      .subscribe(data => {
        this.proveedores = data || [];
        this.proveedoresFiltrados = [...this.proveedores];
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
    this.filtrarEnTiempoReal();

    dialogRef.afterClosed().subscribe(() => {
      this.modalAbiertoChange.emit(false);
    });
  }

  cerrarModal(): void {
    this.dialog.closeAll();
  }

  filtrarEnTiempoReal(): void {
    if (!this.filtroBusqueda.trim()) {
      this.proveedoresFiltrados = [...this.proveedores];
    } else {
      const filtro = this.filtroBusqueda.toLowerCase().trim();
      this.proveedoresFiltrados = this.proveedores.filter(proveedor => 
        this.coincideFiltro(proveedor, filtro)
      );
    }
    this.cdr.markForCheck();
  }

  private coincideFiltro(proveedor: InputProveedor, filtro: string): boolean {
    return proveedor.razonSocial.toLowerCase().includes(filtro) ||
           (proveedor.ruc ? proveedor.ruc.toLowerCase().includes(filtro) : false) ||
           (proveedor.rubro ? proveedor.rubro.toLowerCase().includes(filtro) : false) ||
           (proveedor.telefono ? proveedor.telefono.toLowerCase().includes(filtro) : false);
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.filtrarEnTiempoReal();
  }

  seleccionarProveedor(proveedor: InputProveedor): void {
    this.proveedorSeleccionado = proveedor;
    this.proveedorSeleccionadoChange.emit(proveedor);
    this.cerrarModal();
  }

  limpiarSeleccion(): void {
    this.proveedorSeleccionado = null;
    this.proveedorSeleccionadoChange.emit(null);
  }

  getDisplayText(): string {
    if (!this.proveedorSeleccionado) {
      return this.placeholder;
    }
    return this.proveedorSeleccionado.razonSocial;
  }

  esProveedorSeleccionado(proveedor: InputProveedor): boolean {
    return this.proveedorSeleccionado?.id === proveedor.id;
  }

  trackByProveedor(index: number, proveedor: InputProveedor): any {
    return proveedor.id || index;
  }
}

