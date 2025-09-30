import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { ProveedorService } from '../../components/proveedor.service';
import { InputProveedor } from '../../components/input.proveedor';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.scss']
})
export class ProveedorComponent implements OnInit, OnDestroy {

  proveedores: InputProveedor[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'ruc', 'razonSocial', 'rubro', 'telefono', 'email', 'observaciones', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'ID',
    ruc: 'RUC',
    razonSocial: 'Razón Social',
    rubro: 'Rubro',
    telefono: 'Teléfono',
    email: 'Email',
    observaciones: 'Observaciones',
    acciones: 'Acciones'
  };

  constructor(
    private servicioProveedor: ProveedorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarProveedores();
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
        this.cargarProveedores();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar proveedores con backend
  cargarProveedores(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioProveedor.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarProveedores(), 0);
            return;
          }

          this.proveedores = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar proveedores:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarProveedores();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarProveedor(){
    this.router.navigate(['dashboard/proveedor/crear']);
  }

  editarProveedor(proveedor: InputProveedor){
    if(!proveedor.id) return;
    this.router.navigate(['dashboard/proveedor/editar', proveedor.id]);
  }

  // 🔹 Eliminar proveedor
  eliminarProveedor(proveedor: InputProveedor){
    if(!proveedor.id) return;
    const nombreProveedor = proveedor.razonSocial || proveedor.ruc || 'este proveedor';
    if(confirm(`¿Desea eliminar "${nombreProveedor}"?`)){
      this.servicioProveedor.delete(proveedor.id).subscribe(()=> this.cargarProveedores());
    }
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<InputProveedor>){
    switch(evento.tipo){
      case 'editar': this.editarProveedor(evento.fila); break;
      case 'eliminar': this.eliminarProveedor(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
