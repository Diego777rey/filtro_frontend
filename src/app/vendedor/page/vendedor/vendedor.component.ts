import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { VendedorService } from '../../components/vendedor.service';
import { Vendedor } from '../../components/vendedor';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-vendedor-form',
  templateUrl: './vendedor.component.html',
  styleUrls: ['./vendedor.component.scss']
})
export class VendedorComponent implements OnInit, OnDestroy {
  vendedores: Vendedor[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'codigoVendedor', 'comision', 'sucursal', 'nombre', 'apellido', 'documento', 'telefono', 'email', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'ID',
    codigoVendedor: 'Código Vendedor',
    comision: 'Comisión',
    sucursal: 'Sucursal',
    nombre: 'Nombre',
    apellido: 'Apellido',
    documento: 'Documento',
    telefono: 'Teléfono',
    email: 'Email',
    acciones: 'Acciones'
  };

  constructor(
    private servicioVendedor: VendedorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarVendedores();
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
        this.cargarVendedores();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar vendedores con backend
  cargarVendedores(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioVendedor.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarVendedores(), 0);
            return;
          }

          this.vendedores = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar vendedores:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarVendedores();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarVendedor(){
    this.router.navigate(['dashboard/vendedor/crear']);
  }

  editarVendedor(vendedor: Vendedor){
    if(!vendedor.id) return;
    this.router.navigate(['dashboard/vendedor/editar', vendedor.id]);
  }

  // 🔹 Eliminar vendedor
  eliminarVendedor(vendedor: Vendedor){
    if(!vendedor.id) return;
    if(confirm(`¿Desea eliminar "${vendedor.persona.nombre} ${vendedor.persona.apellido}"?`)){
      this.servicioVendedor.delete(vendedor.id).subscribe(()=> this.cargarVendedores());
    }
  }
  generarReporte(){
    this.router.navigate(['dashboard/vendedor/generar']);
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<Vendedor>){
    switch(evento.tipo){
      case 'editar': this.editarVendedor(evento.fila); break;
      case 'eliminar': this.eliminarVendedor(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
