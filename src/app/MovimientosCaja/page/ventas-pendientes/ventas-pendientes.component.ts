import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MovimientoCajaService } from '../../components/movimiento-caja.service';
import { Venta } from '../../components/movimiento-caja';
import { VentaStateUtil } from '../../../shared/utils/venta-state.util';

@Component({
  selector: 'app-ventas-pendientes',
  templateUrl: './ventas-pendientes.component.html',
  styleUrls: ['./ventas-pendientes.component.scss']
})
export class VentasPendientesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [
    'cliente',
    'vendedor', 
    'total',
    'items',
    'estado',
    'acciones'
  ];
  
  dataSource = new MatTableDataSource<Venta>([]);
  loading = false;
  cajaId = '1'; // TODO: Obtener del contexto del usuario logueado

  constructor(
    private movimientoCajaService: MovimientoCajaService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVentasPendientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVentasPendientes(): void {
    this.loading = true;
    
    this.movimientoCajaService.getVentasPendientes(this.cajaId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ventas) => {
        // Filtrar solo las ventas que están realmente pendientes usando la utilidad
        const ventasPendientes = VentaStateUtil.filterPendingVentas(ventas);
        this.dataSource.data = ventasPendientes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar ventas pendientes:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar las ventas pendientes', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  aceptarVenta(ventaId: number): void {
    if (confirm('¿Está seguro de que desea aceptar esta venta?')) {
      this.loading = true;
      
      this.movimientoCajaService.aceptarVenta(ventaId.toString()).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (resultado) => {
          this.loading = false;
          this.snackBar.open('Venta aceptada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Recargar la tabla completa después de aceptar
          this.loadVentasPendientes();
        },
        error: (error) => {
          console.error('Error al aceptar venta:', error);
          this.loading = false;
          
          let errorMessage = 'Error al aceptar la venta';
          
          // Manejo específico de errores
          if (error.message?.includes('ya fue procesada')) {
            errorMessage = 'Esta venta ya fue procesada anteriormente';
          } else if (error.message?.includes('no se puede procesar')) {
            errorMessage = 'No se puede procesar esta venta en este momento';
          } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
          }
          
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  cancelarVenta(ventaId: number): void {
    if (confirm('¿Está seguro de que desea cancelar esta venta? Esta acción no se puede deshacer.')) {
      this.loading = true;
      
      this.movimientoCajaService.cancelarVenta(ventaId.toString()).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (resultado) => {
          this.loading = false;
          this.snackBar.open('Venta cancelada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Recargar la tabla completa después de cancelar
          this.loadVentasPendientes();
        },
        error: (error) => {
          console.error('Error al cancelar venta:', error);
          this.loading = false;
          
          let errorMessage = 'Error al cancelar la venta';
          
          // Manejo específico de errores
          if (error.message?.includes('ya fue procesada')) {
            errorMessage = 'Esta venta ya fue procesada y no se puede cancelar';
          } else if (error.message?.includes('no se puede cancelar')) {
            errorMessage = 'No se puede cancelar esta venta en este momento';
          } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
          }
          
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // Método removido - ahora se usa el pipe CurrencyFormatPipe

  getTotalItems(items: any[]): number {
    return items?.reduce((total, item) => total + item.cantidad, 0) || 0;
  }

  volver(): void {
    this.router.navigate(['/dashboard/movimientos-caja']);
  }


  // Método optimizado para aplicar filtro
  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    
    // Configurar el predicado de filtro una sola vez
    if (!this.dataSource.filterPredicate) {
      this.dataSource.filterPredicate = this.createFilterPredicate();
    }
    
    this.dataSource.filter = filterValue;
  }

  // Crear predicado de filtro optimizado para prevenir stack overflow
  private createFilterPredicate() {
    return (venta: Venta, filter: string): boolean => {
      if (!filter || !venta) return true;
      
      const searchText = filter.toLowerCase().trim();
      if (!searchText) return true;
      
      // Búsqueda optimizada con early returns
      if (venta.codigoVenta?.toLowerCase().includes(searchText)) return true;
      if (venta.cliente?.persona?.nombre?.toLowerCase().includes(searchText)) return true;
      if (venta.cliente?.persona?.apellido?.toLowerCase().includes(searchText)) return true;
      if (venta.vendedor?.persona?.nombre?.toLowerCase().includes(searchText)) return true;
      if (venta.vendedor?.persona?.apellido?.toLowerCase().includes(searchText)) return true;
      if (venta.total?.toString().includes(searchText)) return true;
      
      // Búsqueda en productos solo si es necesario
      if (venta.items && venta.items.length > 0) {
        for (const item of venta.items) {
          if (item.producto?.nombre?.toLowerCase().includes(searchText)) {
            return true;
          }
        }
      }
      
      return false;
    };
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.dataSource.filter = '';
  }

  // Métodos optimizados que delegan a las utilidades
  getEstadoClass(venta: Venta): string {
    return VentaStateUtil.getStateClass(venta);
  }

  getEstadoIcon(venta: Venta): string {
    return VentaStateUtil.getStateIcon(venta);
  }

  getEstadoText(venta: Venta): string {
    return VentaStateUtil.getStateText(venta);
  }

  getRowClass(venta: Venta): string {
    return VentaStateUtil.getRowClass(venta);
  }
}
