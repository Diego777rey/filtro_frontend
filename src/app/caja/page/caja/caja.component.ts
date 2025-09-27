import { Component, OnInit, OnDestroy } from '@angular/core';
import { Caja } from '../../components/caja';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { CajaService } from '../../components/caja.service';
import { AccionTabla } from 'src/app/reutilizacion/tabla-paginada/accion.tabla';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.scss']
})
export class CajaComponent implements OnInit, OnDestroy {
  cajas: Caja[] = [];
  totalRegistros = 0;
  tamanioPagina = 5;
  paginaActual = 0;
  textoBusqueda = '';
  cargando = false;

  // Subject para búsqueda en tiempo real
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  columnas: string[] = [
    'id', 'codigoCaja', 'descripcion', 'ubicacion', 'estadoCaja', 'saldoInicial', 'saldoActual', 'acciones'
  ];

  nombresColumnas: { [key: string]: string } = {
    id: 'Código',
    codigoCaja: 'Código Caja',
    descripcion: 'Descripción',
    ubicacion: 'Ubicación',
    estadoCaja: 'Estado',
    saldoInicial: 'Saldo Inicial',
    saldoActual: 'Saldo Actual',
    acciones: 'Acciones'
  };

  constructor(
    private servicioCaja: CajaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCajas();
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
        this.cargarCajas();
      });
  }

  // 🔹 Método para manejar cambios en el input de búsqueda
  onSearchChange(searchText: string): void {
    this.textoBusqueda = searchText;
    this.searchSubject.next(searchText);
  }

  // 🔹 Cargar cajas con backend
  cargarCajas(): void {
    this.cargando = true;
    const paginaEnviar = this.paginaActual + 1;

    this.servicioCaja.getPaginated(paginaEnviar, this.tamanioPagina, this.textoBusqueda)
      .subscribe({
        next: data => {
          const items = data?.items || [];
          this.totalRegistros = data?.totalItems || 0;

          if(items.length === 0 && this.totalRegistros > 0 && this.paginaActual > 0){
            this.paginaActual = 0;
            setTimeout(()=> this.cargarCajas(), 0);
            return;
          }

          this.cajas = items;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar cajas:', err);
          this.cargando = false;
        }
      });
  }

  cambiarPagina(evento: PageEvent){
    this.paginaActual = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
    this.cargarCajas();
  }

  // 🔹 Limpiar búsqueda
  limpiarBusqueda(){
    this.textoBusqueda = '';
    this.searchSubject.next(''); // Emitir cadena vacía para limpiar
  }

  agregarCaja(){
    this.router.navigate(['dashboard/caja/crear']);
  }

  generarReporte(){
    this.router.navigate(['dashboard/caja/generar']);
  }

  editarCaja(caja: Caja){
    if(!caja.id) return;
    this.router.navigate(['dashboard/caja/editar', caja.id]);
  }

  // 🔹 Eliminar caja
  eliminarCaja(caja: Caja){
    if(!caja.id) return;
    if(confirm(`¿Desea eliminar "${caja.descripcion}"?`)){
      this.servicioCaja.delete(caja.id).subscribe(()=> this.cargarCajas());
    }
  }

  // 🔹 Manejar acción de fila
  manejarAccion(evento: AccionTabla<Caja>){
    switch(evento.tipo){
      case 'editar': this.editarCaja(evento.fila); break;
      case 'eliminar': this.eliminarCaja(evento.fila); break;
      case 'ver': break;
      case 'custom': break;
    }
  }
}
