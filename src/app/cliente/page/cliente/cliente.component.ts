import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { ClienteService } from '../../components/cliente.service';
import { Cliente } from '../../components/cliente';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ClienteReporteService } from '../../components/cliente.reporte.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'nombre', 'apellido', 'documento', 'telefono', 'email', 'activo', 'fechaRegistro', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'Código',
    nombre: 'Nombre',
    apellido: 'Apellido',
    documento: 'Documento',
    telefono: 'Teléfono',
    email: 'Email',
    activo: 'Estado',
    fechaRegistro: 'Fecha Registro',
    acciones: 'Acciones'
  };

  constructor(
    private servicioCliente: ClienteService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    this.probarQueryClientes();
    this.cargarClientes();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔍 Probar diferentes queries para clientes
  probarQueryClientes(): void {
    // Logs removidos para modo de producción
    this.servicioCliente.getClientes().subscribe({
      next: (clientes) => {
        // Solo log de errores en producción
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      }
    });
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
        this.cargarClientes();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar clientes con backend
  cargarClientes(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioCliente.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarClientes(), 0);
            return;
          }

          this.clientes = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar clientes:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarClientes();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarCliente(){
    this.router.navigate(['dashboard/clientes/crear']);
  }
  generarReporte(){
    this.router.navigate(['dashboard/clientes/generar']);
  }

  editarCliente(cliente: Cliente){
    if(!cliente.id) return;
    this.router.navigate(['dashboard/clientes/editar', cliente.id]);
  }

  //eliminar clientes
  eliminarCliente(cliente: Cliente){
    if(!cliente.id) return;
    if(confirm(`¿Desea eliminar "${cliente.persona.nombre} ${cliente.persona.apellido}"?`)){
      this.servicioCliente.deleteCliente(cliente.id).subscribe(()=> this.cargarClientes());
    }
  }

  //Manejar acción de fila
  manejarAccion(evento: AccionTabla<Cliente>){
    switch(evento.tipo){
      case 'editar': this.editarCliente(evento.fila); break;
      case 'eliminar': this.eliminarCliente(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
