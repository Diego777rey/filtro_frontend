import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { SucursalService } from 'src/app/sucursal/components/sucursal.service';
import { Sucursal } from 'src/app/sucursal/components/sucursal';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador-sucursal',
  templateUrl: './buscador-sucursal.component.html',
  styleUrls: ['./buscador-sucursal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class BuscadorSucursalComponent implements OnInit, OnDestroy {
  @Input() sucursalSeleccionada: Sucursal | null = null;
  @Input() placeholder: string = 'Seleccionar sucursal';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Sucursal';
  @Input() showDireccion: boolean = true;
  
  @Output() sucursalSeleccionadaChange = new EventEmitter<Sucursal | null>();
  @Output() modalAbiertoChange = new EventEmitter<boolean>();

  @ViewChild('modalTemplate', { static: false }) modalTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  
  sucursales: Sucursal[] = [];
  sucursalesFiltradas: Sucursal[] = [];
  loading = false;
  filtroBusqueda = '';
  filtroControl = new FormControl('');

  constructor(
    private sucursalService: SucursalService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();
    this.setupFiltroDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroControl.setValue('', { emitEvent: false });
  }

  private cargarSucursales(): void {
    this.loading = true;
    this.sucursalService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar sucursales:', error);
          return of([]);
        })
      )
      .subscribe(data => {
        this.sucursales = data || [];
        this.sucursalesFiltradas = [...this.sucursales];
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
      maxWidth: '600px',
      maxHeight: '80vh',
      disableClose: false,
      autoFocus: false
    });

    this.modalAbiertoChange.emit(true);
    
    // Resetear filtro al abrir el modal
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.sucursalesFiltradas = [...this.sucursales];
    this.cdr.detectChanges();

    dialogRef.afterClosed().subscribe(() => {
      this.modalAbiertoChange.emit(false);
    });
  }

  cerrarModal(): void {
    this.dialog.closeAll();
  }

  filtrarEnTiempoReal(): void {
    if (!this.filtroBusqueda.trim()) {
      this.sucursalesFiltradas = [...this.sucursales];
    } else {
      const filtro = this.filtroBusqueda.toLowerCase().trim();
      this.sucursalesFiltradas = this.sucursales.filter(sucursal => 
        this.coincideFiltro(sucursal, filtro)
      );
    }
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  private coincideFiltro(sucursal: Sucursal, filtro: string): boolean {
    const nombreMatch = sucursal.nombre?.toLowerCase().includes(filtro) || false;
    const ciudadMatch = sucursal.ciudad?.toLowerCase().includes(filtro) || false;
    const departamentoMatch = sucursal.departamento?.toLowerCase().includes(filtro) || false;
    const direccionMatch = sucursal.direccion?.toLowerCase().includes(filtro) || false;
    
    return nombreMatch || ciudadMatch || departamentoMatch || direccionMatch;
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.filtrarEnTiempoReal();
  }

  seleccionarSucursal(sucursal: Sucursal): void {
    console.log('Sucursal seleccionada:', sucursal);
    console.log('Nombre:', sucursal.nombre);
    
    this.sucursalSeleccionada = sucursal;
    this.sucursalSeleccionadaChange.emit(sucursal);
    this.cerrarModal();
  }

  limpiarSeleccion(): void {
    this.sucursalSeleccionada = null;
    this.sucursalSeleccionadaChange.emit(null);
  }

  getDisplayText(): string {
    if (!this.sucursalSeleccionada) {
      return this.placeholder;
    }
    
    // Verificar que la sucursal tenga propiedades válidas
    const nombre = this.sucursalSeleccionada.nombre?.trim();
    
    if (nombre && nombre !== '') {
      return nombre;
    } else {
      return 'Sucursal sin nombre';
    }
  }

  esSucursalSeleccionada(sucursal: Sucursal): boolean {
    return this.sucursalSeleccionada?.id === sucursal.id;
  }

  trackBySucursal(index: number, sucursal: Sucursal): any {
    return sucursal.id || index;
  }
}
