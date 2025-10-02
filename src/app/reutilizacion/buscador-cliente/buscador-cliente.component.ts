import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, catchError, of, debounceTime, distinctUntilChanged, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Cliente } from 'src/app/cliente/components/cliente';
import { ClienteService } from 'src/app/cliente/components/cliente.service';

@Component({
  selector: 'app-buscador-cliente',
  templateUrl: './buscador-cliente.component.html',
  styleUrls: ['./buscador-cliente.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuscadorClienteComponent implements OnInit, OnDestroy {
  @Input() clienteSeleccionado: Cliente | null = null;
  @Input() placeholder: string = 'Seleccionar cliente';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Cliente';
  @Input() showEmail: boolean = true;
  @Input() showTelefono: boolean = true;
  
  @Output() clienteSeleccionadoChange = new EventEmitter<Cliente | null>();
  @Output() modalAbiertoChange = new EventEmitter<boolean>();

  @ViewChild('modalTemplate', { static: false }) modalTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  loading = false;
  error = false;
  errorMessage = '';
  filtroBusqueda = '';
  filtroControl = new FormControl('');

  constructor(
    private clienteService: ClienteService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.setupFiltroDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroControl.setValue('', { emitEvent: false });
  }

  cargarClientes(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    this.clienteService.getClientes()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar clientes:', error);
          this.loading = false;
          this.error = true;
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          this.clientes = (data || []).map(c => ({
            ...c,
            persona: c.persona || {
              id: c.id,
              nombre: 'Cliente',
              apellido: 'Sin Apellido',
              documento: '',
              telefono: '',
              email: ''
            }
          }));
          this.clientesFiltrados = [...this.clientes];
          this.loading = false;
          this.error = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error en la suscripción:', error);
          this.loading = false;
          this.error = true;
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.markForCheck();
        }
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
    
    // Recargar clientes al abrir el modal
    this.cargarClientes();
    
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
      this.clientesFiltrados = [...this.clientes];
    } else {
      const filtro = this.filtroBusqueda.toLowerCase().trim();
      this.clientesFiltrados = this.clientes.filter(cliente => 
        this.coincideFiltro(cliente, filtro)
      );
    }
    this.cdr.markForCheck();
  }

  private coincideFiltro(cliente: Cliente, filtro: string): boolean {
    const nombreCompleto = `${cliente.persona.nombre} ${cliente.persona.apellido}`.toLowerCase();
    return cliente.persona.nombre.toLowerCase().includes(filtro) ||
           cliente.persona.apellido.toLowerCase().includes(filtro) ||
           nombreCompleto.includes(filtro) ||
           (cliente.persona.documento ? cliente.persona.documento.toLowerCase().includes(filtro) : false) ||
           (cliente.persona.email ? cliente.persona.email.toLowerCase().includes(filtro) : false) ||
           (cliente.persona.telefono ? cliente.persona.telefono.toLowerCase().includes(filtro) : false);
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.filtrarEnTiempoReal();
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.clienteSeleccionadoChange.emit(cliente);
    this.cerrarModal();
  }

  limpiarSeleccion(): void {
    this.clienteSeleccionado = null;
    this.clienteSeleccionadoChange.emit(null);
  }

  getDisplayText(): string {
    if (!this.clienteSeleccionado) {
      return this.placeholder;
    }
    return `${this.clienteSeleccionado.persona.nombre} ${this.clienteSeleccionado.persona.apellido}`;
  }

  esClienteSeleccionado(cliente: Cliente): boolean {
    return this.clienteSeleccionado?.id === cliente.id;
  }

  trackByCliente(index: number, cliente: Cliente): any {
    return cliente.id || index;
  }

  private getErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }
    if (error.networkError) {
      return 'Error de conexión. Verifique su conexión a internet.';
    }
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    }
    return 'Error desconocido al cargar los clientes.';
  }
}
