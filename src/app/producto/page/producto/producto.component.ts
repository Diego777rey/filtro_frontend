import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { ProductoService } from '../../components/producto.service';
import { InputProducto } from '../../components/input.producto';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit, OnDestroy {

  productos: InputProducto[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id','descripcion','precioCompra','precioVenta','stock','activo','categoria','acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'Código',
    descripcion: 'Descripción',
    precioCompra: 'Precio Compra',
    precioVenta: 'Precio Venta',
    stock: 'Stock',
    activo: 'Estado',
    categoria: 'Categoría',
    acciones: 'Acciones'
  };

  constructor(
    private servicioProducto: ProductoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
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
        this.cargarProductos();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar productos con backend
  cargarProductos(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioProducto.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarProductos(), 0);
            return;
          }

          this.productos = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar productos:', err);
          this.cargando = false;
        }
      });
  }
  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarProductos();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }
  agregarProducto(){
    this.router.navigate(['dashboard/producto/crear']);
  }

  editarProducto(producto: InputProducto){
    if(!producto.id) return;
    this.router.navigate(['dashboard/producto/editar', producto.id]);
  }

  // 🔹 Eliminar producto
  eliminarProducto(producto: InputProducto){
    if(!producto.id) return;
    if(confirm(`¿Desea eliminar "${producto.descripcion}"?`)){
      this.servicioProducto.delete(producto.id).subscribe(()=> this.cargarProductos());
    }
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<InputProducto>){
    switch(evento.tipo){
      case 'editar': this.editarProducto(evento.fila); break;
      case 'eliminar': this.eliminarProducto(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }

  // 🔹 Formatear precio en PYG
  formatearPrecio(precio: number): string{
    return new Intl.NumberFormat('es-PY',{style:'currency', currency:'PYG'}).format(precio);
  }
}
