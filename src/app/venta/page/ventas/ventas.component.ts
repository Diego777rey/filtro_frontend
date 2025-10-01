import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { VentaService, Venta, PaginatedResponse } from '../../components/venta.service';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit, OnDestroy {

  ventas: Venta[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'codigoVenta', 'fechaVenta', 'cliente', 'vendedor', 'total', 'estadoVenta', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'ID',
    codigoVenta: 'Código',
    fechaVenta: 'Fecha',
    cliente: 'Cliente',
    vendedor: 'Vendedor',
    total: 'Total',
    estadoVenta: 'Estado',
    acciones: 'Acciones'
  };

  constructor(
    private servicioVenta: VentaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarVentas();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //Configurar suscripción de búsqueda en tiempo real
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), //Esperar 300ms después de que el usuario deje de escribir
        distinctUntilChanged(), //Solo emitir si el valor cambió
        takeUntil(this.destroy$)
      )
      .subscribe(searchText => {
        this.textoBusqueda = searchText;
        this.paginaActual = 0;
        this.cargarVentas();
      });
  }

  //Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  //Cargar ventas con backend usando paginación
  cargarVentas(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioVenta.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarVentas(), 0);
            return;
          }

          this.ventas = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar ventas:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent) {
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarVentas();
  }

  //Limpiar búsqueda
  limpiarBusqueda() {
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarVenta() {
    this.router.navigate(['/dashboard/ventas/crear']);
  }

  editarVenta(venta: Venta) {
    if (!venta.id) return;
    this.router.navigate(['dashboard/ventas/editar', venta.id]);
  }

  //Eliminar venta
  eliminarVenta(venta: Venta) {
    if (!venta.id) return;
    if (confirm(`¿Desea eliminar la venta "${venta.codigoVenta}"?`)) {
      this.servicioVenta.delete(venta.id).subscribe(() => this.cargarVentas());
    }
  }

  //Manejar acción de fila
  manejarAccion(evento: AccionTabla<Venta>) {
    switch (evento.tipo) {
      case 'editar': this.editarVenta(evento.fila); break;
      case 'eliminar': this.eliminarVenta(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }

  // 🔹 Formatear precio en USD
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(precio || 0);
  }

  // 🔹 Formatear fecha
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // 🔹 Obtener nombre completo del cliente
  obtenerNombreCliente(venta: Venta): string {
    if (!venta.cliente?.persona) return 'Sin cliente';
    const persona = venta.cliente.persona;
    return `${persona.nombre || ''} ${persona.apellido || ''}`.trim() || 'Sin nombre';
  }

  // 🔹 Obtener nombre del vendedor
  obtenerNombreVendedor(venta: Venta): string {
    return venta.vendedor?.nombre || 'Sin vendedor';
  }
}
