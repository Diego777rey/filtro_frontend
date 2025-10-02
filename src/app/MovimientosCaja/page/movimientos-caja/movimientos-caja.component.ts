import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';

import { MovimientoCajaService } from '../../components/movimiento-caja.service';
import { MovimientoCaja, MovimientoCajaPaginatedResponse } from '../../components/movimiento-caja';

@Component({
  selector: 'app-movimientos-caja',
  templateUrl: './movimientos-caja.component.html',
  styleUrls: ['./movimientos-caja.component.scss']
})
export class MovimientosCajaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Configuración de la tabla
  displayedColumns: string[] = [
    'fecha', 
    'monto', 
    'tipo', 
    'descripcion', 
    'caja', 
    'venta', 
    'acciones'
  ];
  
  dataSource = new MatTableDataSource<MovimientoCaja>([]);
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Estados
  loading = false;
  searchControl = new FormControl('');
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private movimientoCajaService: MovimientoCajaService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadData();
      });
  }

  loadData(): void {
    this.loading = true;
    const searchTerm = this.searchControl.value || '';
    
    this.movimientoCajaService.getPaginated(
      this.currentPage, 
      this.pageSize, 
      searchTerm
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: MovimientoCajaPaginatedResponse) => {
        this.dataSource.data = response.items;
        this.totalItems = response.totalItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar movimientos de caja:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar los datos', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onSearchClear(): void {
    this.searchControl.setValue('');
  }

  navigateToCreate(): void {
    this.router.navigate(['/dashboard/movimientos-caja/nuevo']);
  }

  navigateToVentasPendientes(): void {
    this.router.navigate(['/dashboard/movimientos-caja/ventas-pendientes']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/movimientos-caja/editar', id]);
  }

  deleteMovimiento(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este movimiento de caja?')) {
      this.loading = true;
      
      this.movimientoCajaService.delete(id.toString()).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Movimiento de caja eliminado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadData();
        },
        error: (error) => {
          console.error('Error al eliminar movimiento de caja:', error);
          this.loading = false;
          this.snackBar.open('Error al eliminar el movimiento de caja', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
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
          this.loadData();
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
          this.loadData();
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'warn';
      case 'aceptada': return 'primary';
      case 'cancelada': return 'accent';
      default: return '';
    }
  }
}
