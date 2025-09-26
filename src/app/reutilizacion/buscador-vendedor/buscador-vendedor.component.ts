import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { VendedorService } from '../../vendedor/components/vendedor.service';
import { Vendedor } from '../../vendedor/components/vendedor';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador-vendedor',
  templateUrl: './buscador-vendedor.component.html',
  styleUrls: ['./buscador-vendedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuscadorVendedorComponent implements OnInit, OnDestroy {
  @Input() vendedorSeleccionado: Vendedor | null = null;
  @Input() placeholder: string = 'Seleccionar vendedor';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Vendedor';
  @Input() showEmail: boolean = true;
  
  @Output() vendedorSeleccionadoChange = new EventEmitter<Vendedor | null>();
  @Output() modalAbiertoChange = new EventEmitter<boolean>();

  @ViewChild('modalTemplate', { static: false }) modalTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  
  vendedores: Vendedor[] = [];
  vendedoresFiltrados: Vendedor[] = [];
  loading = false;
  filtroBusqueda = '';
  filtroControl = new FormControl('');

  constructor(
    private vendedorService: VendedorService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarVendedores();
    this.setupFiltroDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroControl.setValue('', { emitEvent: false });
  }

  private cargarVendedores(): void {
    this.loading = true;
    this.vendedorService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar vendedores:', error);
          return of([]);
        })
      )
      .subscribe(data => {
        this.vendedores = data || [];
        this.vendedoresFiltrados = [...this.vendedores];
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
      this.vendedoresFiltrados = [...this.vendedores];
    } else {
      const filtro = this.filtroBusqueda.toLowerCase().trim();
      this.vendedoresFiltrados = this.vendedores.filter(vendedor => 
        this.coincideFiltro(vendedor, filtro)
      );
    }
    this.cdr.markForCheck();
  }

  private coincideFiltro(vendedor: Vendedor, filtro: string): boolean {
    const nombreCompleto = `${vendedor.persona.nombre} ${vendedor.persona.apellido}`.toLowerCase();
    return vendedor.persona.nombre.toLowerCase().includes(filtro) ||
           vendedor.persona.apellido.toLowerCase().includes(filtro) ||
           nombreCompleto.includes(filtro) ||
           (vendedor.persona.documento ? vendedor.persona.documento.toLowerCase().includes(filtro) : false);
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.filtrarEnTiempoReal();
  }

  seleccionarVendedor(vendedor: Vendedor): void {
    this.vendedorSeleccionado = vendedor;
    this.vendedorSeleccionadoChange.emit(vendedor);
    this.cerrarModal();
  }

  limpiarSeleccion(): void {
    this.vendedorSeleccionado = null;
    this.vendedorSeleccionadoChange.emit(null);
  }

  getDisplayText(): string {
    if (!this.vendedorSeleccionado) {
      return this.placeholder;
    }
    return `${this.vendedorSeleccionado.persona.nombre} ${this.vendedorSeleccionado.persona.apellido}`;
  }

  esVendedorSeleccionado(vendedor: Vendedor): boolean {
    return this.vendedorSeleccionado?.id === vendedor.id;
  }

  trackByVendedor(index: number, vendedor: Vendedor): any {
    return vendedor.id || index;
  }
}
