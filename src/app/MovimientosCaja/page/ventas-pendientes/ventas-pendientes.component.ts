import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    'acciones'
  ];
  
  dataSource = new MatTableDataSource<Venta>([]);
  loading = false;
  cajaId = '1'; // TODO: Obtener del contexto del usuario logueado

  constructor(
    private movimientoCajaService: MovimientoCajaService,
    private snackBar: MatSnackBar
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
        this.dataSource.data = ventas;
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
          this.loadVentasPendientes();
        },
        error: (error) => {
          console.error('Error al aceptar venta:', error);
          this.loading = false;
          this.snackBar.open('Error al aceptar la venta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  cancelarVenta(ventaId: number): void {
    if (confirm('¿Está seguro de que desea cancelar esta venta?')) {
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
          this.loadVentasPendientes();
        },
        error: (error) => {
          console.error('Error al cancelar venta:', error);
          this.loading = false;
          this.snackBar.open('Error al cancelar la venta', 'Cerrar', {
            duration: 3000,
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
}
