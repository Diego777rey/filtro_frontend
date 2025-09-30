import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { CajeroService } from '../../components/cajero.service';
import { Cajero } from '../../components/cajero';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cajero-form',
  templateUrl: './cajero.component.html',
  styleUrls: ['./cajero.component.scss']
})
export class CajeroComponent implements OnInit, OnDestroy {
  cajeros: Cajero[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'codigoCajero', 'turno', 'sucursal', 'nombre', 'apellido', 'documento', 'telefono', 'email', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'ID',
    codigoCajero: 'Código Cajero',
    turno: 'Turno',
    sucursal: 'Sucursal',
    nombre: 'Nombre',
    apellido: 'Apellido',
    documento: 'Documento',
    telefono: 'Teléfono',
    email: 'Email',
    acciones: 'Acciones'
  };

  constructor(
    private servicioCajero: CajeroService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCajeros();
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
        this.cargarCajeros();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar cajeros con backend
  cargarCajeros(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioCajero.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarCajeros(), 0);
            return;
          }

          this.cajeros = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar cajeros:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarCajeros();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarCajero(){
    this.router.navigate(['dashboard/cajero/crear']);
  }

  editarCajero(cajero: Cajero){
    if(!cajero.id) return;
    this.router.navigate(['dashboard/cajero/editar', cajero.id]);
  }

  // 🔹 Eliminar cajero
  eliminarCajero(cajero: Cajero){
    if(!cajero.id) return;
    if(confirm(`¿Desea eliminar "${cajero.persona.nombre} ${cajero.persona.apellido}"?`)){
      this.servicioCajero.delete(cajero.id).subscribe(()=> this.cargarCajeros());
    }
  }
  generarReporte(){
    this.router.navigate(['dashboard/cajero/generar']);
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<Cajero>){
    switch(evento.tipo){
      case 'editar': this.editarCajero(evento.fila); break;
      case 'eliminar': this.eliminarCajero(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
