import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoriaService } from 'src/app/categoria/components/categoria.service';
import { Categoria } from 'src/app/categoria/components/categoria';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador-categoria',
  templateUrl: './buscador-categoria.component.html',
  styleUrls: ['./buscador-categoria.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class BuscadorCategoriaComponent implements OnInit, OnDestroy {
  @Input() categoriaSeleccionada: Categoria | null = null;
  @Input() placeholder: string = 'Seleccionar categoría';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Categoría';
  @Input() showDescripcion: boolean = true;
  
  @Output() categoriaSeleccionadaChange = new EventEmitter<Categoria | null>();
  @Output() modalAbiertoChange = new EventEmitter<boolean>();

  @ViewChild('modalTemplate', { static: false }) modalTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  loading = false;
  filtroBusqueda = '';
  filtroControl = new FormControl('');

  constructor(
    private categoriaService: CategoriaService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.setupFiltroDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroControl.setValue('', { emitEvent: false });
  }

  private cargarCategorias(): void {
    this.loading = true;
    this.categoriaService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar categorías:', error);
          return of([]);
        })
      )
      .subscribe(data => {
        this.categorias = data || [];
        this.categoriasFiltradas = [...this.categorias];
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
    this.categoriasFiltradas = [...this.categorias];
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
      this.categoriasFiltradas = [...this.categorias];
    } else {
      const filtro = this.filtroBusqueda.toLowerCase().trim();
      this.categoriasFiltradas = this.categorias.filter(categoria => 
        this.coincideFiltro(categoria, filtro)
      );
    }
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  private coincideFiltro(categoria: Categoria, filtro: string): boolean {
    const descripcionMatch = categoria.descripcion?.toLowerCase().includes(filtro) || false;
    
    return descripcionMatch;
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.filtrarEnTiempoReal();
  }

  seleccionarCategoria(categoria: Categoria): void {
    console.log('Categoría seleccionada:', categoria);
    console.log('Descripción:', categoria.descripcion);
    
    this.categoriaSeleccionada = categoria;
    this.categoriaSeleccionadaChange.emit(categoria);
    this.cerrarModal();
  }

  limpiarSeleccion(): void {
    this.categoriaSeleccionada = null;
    this.categoriaSeleccionadaChange.emit(null);
  }

  getDisplayText(): string {
    if (!this.categoriaSeleccionada) {
      return this.placeholder;
    }
    
    // Verificar que la categoría tenga propiedades válidas
    const descripcion = this.categoriaSeleccionada.descripcion?.trim();
    
    if (descripcion && descripcion !== '') {
      return descripcion;
    } else {
      return 'Categoría sin descripción';
    }
  }

  esCategoriaSeleccionada(categoria: Categoria): boolean {
    return this.categoriaSeleccionada?.id === categoria.id;
  }

  trackByCategoria(index: number, categoria: Categoria): any {
    return categoria.id || index;
  }
}
