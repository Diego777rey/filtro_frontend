import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { PersonaService } from '../../Personas/components/persona.service';
import { Persona } from '../../Personas/components/persona';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador-persona',
  templateUrl: './buscador-persona.component.html',
  styleUrls: ['./buscador-persona.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuscadorPersonaComponent implements OnInit, OnDestroy {
  @Input() personaSeleccionada: Persona | null = null;
  @Input() placeholder: string = 'Seleccionar persona';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Persona';
  @Input() showEmail: boolean = true;
  
  @Output() personaSeleccionadaChange = new EventEmitter<Persona | null>();
  @Output() modalAbiertoChange = new EventEmitter<boolean>();

  @ViewChild('modalTemplate', { static: false }) modalTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  
  personas: Persona[] = [];
  personasFiltradas: Persona[] = [];
  loading = false;
  filtroBusqueda = '';
  filtroControl = new FormControl('');

  constructor(
    private personaService: PersonaService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPersonas();
    this.setupFiltroDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filtroControl.setValue('', { emitEvent: false });
  }

  private cargarPersonas(): void {
    this.loading = true;
    this.personaService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar personas:', error);
          return of([]);
        })
      )
      .subscribe(data => {
        // Convertir PersonaFromService a Persona
        this.personas = (data || []).map(this.convertirPersona);
        this.personasFiltradas = [...this.personas];
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private convertirPersona(personaFromService: Persona): Persona {
    return {
      id: personaFromService.id,
      nombre: personaFromService.nombre,
      apellido: personaFromService.apellido,
      documento: personaFromService.documento,
      telefono: personaFromService.telefono,
      email: personaFromService.email,
      direccion: personaFromService.direccion,
      estadoPersona: personaFromService.estadoPersona,
      fechaNacimiento: personaFromService.fechaNacimiento,
      roles: personaFromService.roles?.map((role: any) => ({
        id: role.id,
        tipoPersona: role.tipoPersona
      }))
    };
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
      this.personasFiltradas = [...this.personas];
    } else {
      const filtro = this.filtroBusqueda.toLowerCase().trim();
      this.personasFiltradas = this.personas.filter(persona => 
        this.coincideFiltro(persona, filtro)
      );
    }
    this.cdr.markForCheck();
  }

  private coincideFiltro(persona: Persona, filtro: string): boolean {
    const nombreCompleto = `${persona.nombre} ${persona.apellido}`.toLowerCase();
    return persona.nombre.toLowerCase().includes(filtro) ||
           persona.apellido.toLowerCase().includes(filtro) ||
           nombreCompleto.includes(filtro) ||
           (persona.documento ? persona.documento.toLowerCase().includes(filtro) : false);
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.filtroControl.setValue('', { emitEvent: false });
    this.filtrarEnTiempoReal();
  }

  seleccionarPersona(persona: Persona): void {
    this.personaSeleccionada = persona;
    this.personaSeleccionadaChange.emit(persona);
    this.cerrarModal();
  }

  limpiarSeleccion(): void {
    this.personaSeleccionada = null;
    this.personaSeleccionadaChange.emit(null);
  }

  getDisplayText(): string {
    if (!this.personaSeleccionada) {
      return this.placeholder;
    }
    return `${this.personaSeleccionada.nombre} ${this.personaSeleccionada.apellido}`;
  }

  esPersonaSeleccionada(persona: Persona): boolean {
    return this.personaSeleccionada?.id === persona.id;
  }

  trackByPersona(index: number, persona: Persona): any {
    return persona.id || index;
  }
}