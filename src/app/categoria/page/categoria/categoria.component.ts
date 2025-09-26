import { Component, OnInit, OnDestroy } from '@angular/core';
import { Categoria } from '../../components/categoria';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { CategoriaService } from '../../components/categoria.service';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss']
})
export class CategoriaComponent implements OnInit, OnDestroy {
  categorias: Categoria[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'descripcion', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'Código',
    descripcion: 'Descripción',
    acciones: 'Acciones'
  };

  constructor(
    private servicioCategoria: CategoriaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
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
        this.cargarCategorias();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar categorías con backend
  cargarCategorias(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioCategoria.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarCategorias(), 0);
            return;
          }

          this.categorias = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar categorías:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarCategorias();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarCategoria(){
    this.router.navigate(['dashboard/categoria/crear']);
  }

  generarReporte(){
    this.router.navigate(['dashboard/categoria/generar']);
  }

  editarCategoria(categoria: Categoria){
    if(!categoria.id) return;
    this.router.navigate(['dashboard/categoria/editar', categoria.id]);
  }

  // 🔹 Eliminar categoría
  eliminarCategoria(categoria: Categoria){
    if(!categoria.id) return;
    if(confirm(`¿Desea eliminar "${categoria.descripcion}"?`)){
      this.servicioCategoria.delete(categoria.id).subscribe(()=> this.cargarCategorias());
    }
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<Categoria>){
    switch(evento.tipo){
      case 'editar': this.editarCategoria(evento.fila); break;
      case 'eliminar': this.eliminarCategoria(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
