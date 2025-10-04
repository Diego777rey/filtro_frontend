import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';

import { VentaService, Venta, PaginatedResponse } from '../../components/venta.service';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Configuración de la tabla
  displayedColumns: string[] = [
    'codigoVenta',
    'fechaVenta', 
    'cliente',
    'vendedor',
    'total',
    'estadoVenta',
    'acciones'
  ];
  
  dataSource = new MatTableDataSource<Venta>([]);
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
    private ventaService: VentaService,
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
    
    this.ventaService.getPaginated(
      this.currentPage + 1, // GraphQL espera página basada en 1
      this.pageSize, 
      searchTerm
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: PaginatedResponse<Venta>) => {
        this.dataSource.data = response.items || [];
        this.totalItems = response.totalItems || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
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
    this.router.navigate(['/dashboard/ventas/crear']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/ventas/editar', id]);
  }

  deleteVenta(id: number): void {
    const venta = this.findVentaById(id);
    
    // Mostrar mensaje informativo si la venta está cancelada, pero permitir eliminación
    if (this.isVentaCancelada(venta)) {
      this.showInfoMessage('Esta venta está cancelada, pero puede ser eliminada del sistema');
    }
    
    if (this.confirmDeletion()) {
      this.executeDeletion(id);
    }
  }

  private findVentaById(id: number): Venta | undefined {
    return this.dataSource.data.find((v: Venta) => v.id === id);
  }

  private isVentaCancelada(venta: Venta | undefined): boolean {
    return venta?.estadoVenta === 'CANCELADA';
  }

  private showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['info-snackbar']
    });
  }

  private confirmDeletion(): boolean {
    return confirm('¿Está seguro de que desea eliminar esta venta?');
  }

  private executeDeletion(id: number): void {
    this.loading = true;
    
    this.ventaService.delete(id.toString()).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => this.handleDeletionSuccess(),
      error: (error) => this.handleDeletionError(error)
    });
  }

  private handleDeletionSuccess(): void {
    this.loading = false;
    this.snackBar.open('Venta eliminada exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.loadData();
  }

  private handleDeletionError(error: any): void {
    console.error('Error al eliminar venta:', error);
    this.loading = false;
    
    const errorMessage = this.getErrorMessage(error);
    this.snackBar.open(errorMessage, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private getErrorMessage(error: any): string {
    const errorMessages = {
      'ya ha sido anulada': 'Esta venta ya ha sido eliminada anteriormente',
      'no se puede eliminar': 'No se puede eliminar esta venta debido a restricciones de negocio',
      'no encontrada': 'La venta no existe o ya ha sido eliminada'
    };

    // Manejo de errores GraphQL
    if (error.graphQLErrors?.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      
      // Buscar mensaje de negocio primero
      const businessMessage = this.findMatchingErrorMessage(graphQLError.message, errorMessages);
      if (businessMessage) {
        return businessMessage;
      }
      
      // Si es un error técnico de GraphQL, mostrar mensaje más amigable
      if (graphQLError.message.includes('non null type') && graphQLError.message.includes('deleteVenta')) {
        return 'Esta venta ya ha sido eliminada anteriormente';
      }
      
      return `Error: ${graphQLError.message}`;
    }

    // Manejo de errores generales
    return this.findMatchingErrorMessage(error.message, errorMessages) || 
           `Error: ${error.message || 'Error desconocido'}`;
  }

  private findMatchingErrorMessage(message: string, errorMessages: Record<string, string>): string | null {
    if (!message) return null;
    
    for (const [key, value] of Object.entries(errorMessages)) {
      if (message.includes(key)) {
        return value;
      }
    }
    return null;
  }

  updateVentaStatus(id: number, estado: string): void {
    if (confirm(`¿Está seguro de que desea cambiar el estado a "${estado}"?`)) {
      this.loading = true;
      
      this.ventaService.updateStatus(id.toString(), estado).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Estado actualizado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadData();
        },
        error: (error) => {
          console.error('Error al actualizar estado:', error);
          this.loading = false;
          this.snackBar.open('Error al actualizar el estado', 'Cerrar', {
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
    }).format(amount || 0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getClienteName(venta: Venta): string {
    if (!venta.cliente?.persona) return 'Sin cliente';
    const persona = venta.cliente.persona;
    return `${persona.nombre || ''} ${persona.apellido || ''}`.trim() || 'Sin nombre';
  }

  getVendedorName(venta: Venta): string {
    return venta.vendedor?.nombre || 'Sin vendedor';
  }

  getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'warn';
      case 'confirmada': return 'primary';
      case 'cancelada': return 'accent';
      case 'entregada': return 'accent';
      default: return '';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'schedule';
      case 'confirmada': return 'check_circle';
      case 'cancelada': return 'cancel';
      case 'entregada': return 'local_shipping';
      default: return 'help';
    }
  }
}
