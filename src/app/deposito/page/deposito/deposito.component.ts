import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { DepositeroService } from '../../components/depositero.service';
import { Depositero } from '../../components/depositero';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-deposito',
  templateUrl: './deposito.component.html',
  styleUrls: ['./deposito.component.scss']
})
export class DepositoComponent implements OnInit, OnDestroy {
  depositeros: Depositero[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'codigoDepositero', 'fechaIngreso', 'turno', 'almacenAsignado', 'supervisor', 'horario', 'estado', 'persona', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'ID',
    codigoDepositero: 'Código',
    fechaIngreso: 'Fecha Ingreso',
    turno: 'Turno',
    almacenAsignado: 'Almacén',
    supervisor: 'Supervisor',
    horario: 'Horario',
    estado: 'Estado',
    persona: 'Persona',
    acciones: 'Acciones'
  };

  constructor(
    private servicioDepositero: DepositeroService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDepositeros();
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
        this.cargarDepositeros();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchText = target.value;
    this.onSearchChange(searchText);
  }

  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar depositeros con backend
  cargarDepositeros(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioDepositero.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarDepositeros(), 0);
            return;
          }

          this.depositeros = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar depositeros:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarDepositeros();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarDepositero(){
    this.router.navigate(['dashboard/deposito/crear']);
  }

  editarDepositero(depositero: Depositero){
    if(!depositero.id) return;
    this.router.navigate(['dashboard/deposito/editar', depositero.id]);
  }

  // 🔹 Eliminar depositero
  eliminarDepositero(depositero: Depositero){
    if(!depositero.id) return;
    if(confirm(`¿Desea eliminar el depositero "${depositero.codigoDepositero}"?`)){
      this.servicioDepositero.delete(depositero.id).subscribe(()=> this.cargarDepositeros());
    }
  }

  generarReporte(){
    this.router.navigate(['dashboard/deposito/generar']);
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<Depositero>){
    switch(evento.tipo){
      case 'editar': this.editarDepositero(evento.fila); break;
      case 'eliminar': this.eliminarDepositero(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
