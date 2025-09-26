import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { VentaService } from '../../components/venta.service';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

type Cliente = { id?: number; nombre: string; apellido: string };
type Vendedor = { id?: number; nombre: string; apellido: string };
type Producto = { id?: number; descripcion: string; precio: number };
type ProductoVenta = { productoId?: number; descripcion: string; cantidad: number; precio: number; subtotal: number };
type Venta = {
  id?: number;
  cliente: Cliente;
  vendedor: Vendedor;
  fecha: string | Date; 
  items: ProductoVenta[];
  total?: number;
};

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
    'id', 'fecha', 'cliente', 'vendedor', 'total', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'Código',
    fecha: 'Fecha',
    cliente: 'Cliente',
    vendedor: 'Vendedor',
    total: 'Total',
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

  //Cargar ventas con backend
  cargarVentas(): void {
    this.cargando = true;

    this.servicioVenta.obtenerVentas().subscribe({
      next: data => {
        //Simular paginación del lado del cliente por ahora
        let ventasFiltradas = data;
        
        //Aplicar filtro de búsqueda
        if (this.textoBusqueda) {
          const searchLower = this.textoBusqueda.toLowerCase();
          ventasFiltradas = data.filter((v: any) =>
            v.cliente?.nombre?.toLowerCase().includes(searchLower) ||
            v.vendedor?.nombre?.toLowerCase().includes(searchLower) ||
            v.fecha?.toString().includes(searchLower)
          );
        }

        this.totalRegistros = ventasFiltradas.length;
        
        // Aplicar paginación y calcular totales
        const startIndex = this.paginaActual * this.tamanioPagina;
        const endIndex = startIndex + this.tamanioPagina;
        this.ventas = ventasFiltradas.slice(startIndex, endIndex).map(venta => ({
          ...venta,
          total: this.calcularTotalVenta(venta)
        }));
        
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
    if (confirm(`¿Desea eliminar la venta del cliente "${venta.cliente?.nombre}"?`)) {
      this.servicioVenta.eliminarVenta(venta.id).subscribe(() => this.cargarVentas());
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

  // 🔹 Calcular el total de una venta sumando los subtotales de los items
  calcularTotalVenta(venta: any): number {
    if (!venta.items || venta.items.length === 0) {
      // Venta sin items - mostrar $0.00
      return 0;
    }
    
    const total = venta.items.reduce((total: number, item: any) => {
      return total + (item.subtotal || 0);
    }, 0);
    
    return total;
  }

  // 🔹 Formatear precio en USD
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(precio);
  }
}
