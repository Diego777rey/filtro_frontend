import { Component, OnInit, OnDestroy } from '@angular/core';
import { Sucursal } from '../../components/sucursal';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { SucursalService } from '../../components/sucursal.service';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sucursal',
  templateUrl: './sucursal.component.html',
  styleUrls: ['./sucursal.component.scss']
})
export class SucursalComponent implements OnInit, OnDestroy {
  sucursales: Sucursal[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'nombre', 'pais', 'departamento', 'ciudad', 'direccion', 'telefono', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'Código',
    nombre: 'Nombre',
    pais: 'Pais',
    departamento: 'Departamneto',
    ciudad: 'Ciudad',
    direccion: 'Dirección',
    telefono: 'Teléfono',
    acciones: 'Acciones'
  };

  constructor(
    private servicioSucursal: SucursalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarSucursales();
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
        this.cargarSucursales();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar sucursales con backend
  cargarSucursales(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioSucursal.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if (items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0) {
            this.paginaActual = 0;
            setTimeout(() => this.cargarSucursales(), 0);
            return;
          }

          this.sucursales = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar sucursales:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent) {
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarSucursales();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda() {
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarSucursal() {
    this.router.navigate(['dashboard/sucursal/crear']);
  }

  generarReporte() {
    this.router.navigate(['dashboard/sucursal/generar']);
  }

  editarSucursal(sucursal: Sucursal) {
    if (!sucursal.id) return;
    this.router.navigate(['dashboard/sucursal/editar', sucursal.id]);
  }

  // 🔹 Eliminar sucursal
  eliminarSucursal(sucursal: Sucursal) {
    if (!sucursal.id) return;
    if (confirm(`¿Desea eliminar "${sucursal.nombre}"?`)) {
      this.servicioSucursal.delete(sucursal.id).subscribe(() => this.cargarSucursales());
    }
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<Sucursal>) {
    switch (evento.tipo) {
      case 'editar': this.editarSucursal(evento.fila); break;
      case 'eliminar': this.eliminarSucursal(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
