import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { PersonaService } from '../../components/persona.service';
import { Persona } from '../../components/persona';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.scss']
})
export class PersonasComponent implements OnInit, OnDestroy {
  personas: Persona[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'nombre', 'apellido', 'documento', 'telefono', 'email', 'direccion', 'estadoPersona', 'fechaNacimiento', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'ID',
    nombre: 'Nombre',
    apellido: 'Apellido',
    documento: 'Documento',
    telefono: 'Teléfono',
    email: 'Email',
    direccion: 'Dirección',
    estadoPersona: 'Estado',
    fechaNacimiento: 'Fecha Nacimiento',
    acciones: 'Acciones'
  };

  constructor(
    private servicioPersona: PersonaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarPersonas();
    this.setupSearchSubscription();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔹 Configurar suscripción de búsqueda en tiempo real
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Esperar 300ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo emitir si el valor cambió
        takeUntil(this.destroy$)
      )
      .subscribe(searchText => {
        this.textoBusqueda = searchText;
        this.paginaActual = 0;
        this.cargarPersonas();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar personas con backend
  cargarPersonas(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioPersona.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarPersonas(), 0);
            return;
          }

          this.personas = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar personas:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarPersonas();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarPersona(){
    this.router.navigate(['dashboard/personas/crear']);
  }

  editarPersona(persona: Persona){
    if(!persona.id) return;
    this.router.navigate(['dashboard/personas/editar', persona.id]);
  }

  // 🔹 Eliminar persona
  eliminarPersona(persona: Persona){
    if(!persona.id) return;
    if(confirm(`¿Desea eliminar "${persona.nombre} ${persona.apellido}"?`)){
      this.servicioPersona.delete(persona.id.toString()).subscribe(()=> this.cargarPersonas());
    }
  }

  generarReporte(){
    this.router.navigate(['dashboard/personas/generar']);
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<Persona>){
    switch(evento.tipo){
      case 'editar': this.editarPersona(evento.fila); break;
      case 'eliminar': this.eliminarPersona(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
