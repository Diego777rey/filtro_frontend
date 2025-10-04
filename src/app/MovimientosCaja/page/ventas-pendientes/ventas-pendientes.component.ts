import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MovimientoCajaService } from '../../components/movimiento-caja.service';
import { Venta } from '../../components/movimiento-caja';

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
        // Filtrar solo las ventas que están realmente pendientes
        const ventasPendientes = ventas.filter(venta => 
          !venta.estado || venta.estado === 'pendiente' || venta.estadoVenta === 'PENDIENTE'
        );
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
        next: () => {
          this.loading = false;
          this.snackBar.open('Venta aceptada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Remover la venta de la tabla
          this.dataSource.data = this.dataSource.data.filter(v => v.id !== ventaId);
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
        next: () => {
          this.loading = false;
          this.snackBar.open('Venta cancelada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Remover la venta de la tabla
          this.dataSource.data = this.dataSource.data.filter(v => v.id !== ventaId);
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getTotalItems(items: any[]): number {
    return items?.reduce((total, item) => total + item.cantidad, 0) || 0;
  }

  volver(): void {
    this.router.navigate(['/dashboard/movimientos-caja']);
  }

  // Método para refrescar la lista de ventas pendientes
  refrescarVentasPendientes(): void {
    this.loadVentasPendientes();
  }

  // Método para aplicar filtro adicional si es necesario
  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (venta: Venta, filter: string) => {
      const searchText = filter.toLowerCase();
      
      // Buscar en código de venta
      if (venta.codigoVenta?.toLowerCase().includes(searchText)) {
        return true;
      }
      
      // Buscar en nombre del cliente
      if (venta.cliente?.persona?.nombre?.toLowerCase().includes(searchText) ||
          venta.cliente?.persona?.apellido?.toLowerCase().includes(searchText)) {
        return true;
      }
      
      // Buscar en nombre del vendedor
      if (venta.vendedor?.persona?.nombre?.toLowerCase().includes(searchText) ||
          venta.vendedor?.persona?.apellido?.toLowerCase().includes(searchText)) {
        return true;
      }
      
      // Buscar en total
      if (venta.total?.toString().includes(searchText)) {
        return true;
      }
      
      // Buscar en productos
      if (venta.items?.some(item => 
        item.producto?.nombre?.toLowerCase().includes(searchText))) {
        return true;
      }
      
      return false;
    };
    
    this.dataSource.filter = filterValue.trim();
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.dataSource.filter = '';
  }

  getEstadoClass(venta: Venta): string {
    if (!venta.estado || venta.estado === 'pendiente') {
      return 'estado-pendiente';
    } else if (venta.estado === 'aceptada') {
      return 'estado-aceptada';
    } else if (venta.estado === 'cancelada') {
      return 'estado-cancelada';
    }
    return 'estado-pendiente';
  }

  getEstadoIcon(venta: Venta): string {
    if (!venta.estado || venta.estado === 'pendiente') {
      return 'schedule';
    } else if (venta.estado === 'aceptada') {
      return 'check_circle';
    } else if (venta.estado === 'cancelada') {
      return 'cancel';
    }
    return 'schedule';
  }

  getEstadoText(venta: Venta): string {
    if (!venta.estado || venta.estado === 'pendiente') {
      return 'Pendiente';
    } else if (venta.estado === 'aceptada') {
      return 'Aceptada';
    } else if (venta.estado === 'cancelada') {
      return 'Cancelada';
    }
    return 'Pendiente';
  }

  getRowClass(venta: Venta): string {
    if (venta.estado === 'aceptada') {
      return 'row-accepted';
    } else if (venta.estado === 'cancelada') {
      return 'row-cancelled';
    }
    return '';
  }
}
