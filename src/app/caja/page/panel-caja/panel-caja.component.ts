import { Component, OnInit } from '@angular/core';
import { CajaService } from '../../components/caja.service';
import { VentaService, Venta } from '../../../venta/components/venta.service';
import { MovimientoCajaService } from '../../../MovimientosCaja/components/movimiento-caja.service';
import { CajeroService } from '../../../cajero/components/cajero.service';
import { Cajero } from '../../../cajero/components/cajero';

@Component({
  selector: 'app-panel-caja',
  templateUrl: './panel-caja.component.html',
  styleUrls: ['./panel-caja.component.scss']
})
export class PanelCajaComponent implements OnInit {
  
  // Estado de la caja
  cajaActual: any = null;
  cajeroActual: Cajero | null = null;
  resumenCaja: any = null;
  
  // Ventas pendientes
  ventasPendientes: Venta[] = [];
  
  // Estados de carga
  cargando = false;
  cargandoVentas = false;
  
  // Formularios
  saldoInicial = 0;
  saldoFinal = 0;
  motivoCancelacion = '';
  
  // Filtros
  fechaFiltro = new Date().toISOString().split('T')[0];

  constructor(
    private cajaService: CajaService,
    private ventaService: VentaService,
    private movimientoCajaService: MovimientoCajaService,
    private cajeroService: CajeroService
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    // Aquí deberías obtener el cajero actual del servicio de autenticación
    const cajeroId = 1; // Esto debería venir del servicio de autenticación
    
    this.cajeroService.getById(cajeroId).subscribe({
      next: (cajero) => {
        this.cajeroActual = cajero;
        this.cargarCajasAbiertas();
      },
      error: (error) => {
        console.error('Error al cargar cajero:', error);
        this.cargando = false;
      }
    });
  }

  cargarCajasAbiertas(): void {
    if (!this.cajeroActual?.id) return;
    
    this.cajaService.getCajasAbiertasPorCajero(this.cajeroActual.id).subscribe({
      next: (cajas) => {
        if (cajas.length > 0) {
          this.cajaActual = cajas[0];
          this.cargarResumenCaja();
          this.cargarVentasPendientes();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar cajas:', error);
        this.cargando = false;
      }
    });
  }

  cargarResumenCaja(): void {
    if (!this.cajaActual?.id) return;
    
    this.movimientoCajaService.getResumenCaja(this.cajaActual.id.toString()).subscribe({
      next: (resumen) => {
        this.resumenCaja = resumen;
      },
      error: (error) => {
        console.error('Error al cargar resumen:', error);
      }
    });
  }

  cargarVentasPendientes(): void {
    if (!this.cajaActual?.id) return;
    
    this.cargandoVentas = true;
    this.ventaService.getVentasPendientesPorCaja(this.cajaActual.id.toString()).subscribe({
      next: (ventas) => {
        this.ventasPendientes = ventas;
        this.cargandoVentas = false;
      },
      error: (error) => {
        console.error('Error al cargar ventas pendientes:', error);
        this.cargandoVentas = false;
      }
    });
  }

  abrirCaja(): void {
    if (!this.cajeroActual?.id || !this.cajaActual?.id) return;
    
    this.cargando = true;
    this.cajaService.abrirCaja(this.cajaActual.id, this.cajeroActual.id, this.saldoInicial).subscribe({
      next: (caja) => {
        this.cajaActual = caja;
        this.cargarResumenCaja();
        this.cargarVentasPendientes();
        this.cargando = false;
        alert('Caja abierta exitosamente');
      },
      error: (error) => {
        console.error('Error al abrir caja:', error);
        this.cargando = false;
        alert('Error al abrir la caja');
      }
    });
  }

  cerrarCaja(): void {
    if (!this.cajaActual?.id) return;
    
    this.cargando = true;
    this.cajaService.cerrarCaja(this.cajaActual.id, this.saldoFinal).subscribe({
      next: (caja) => {
        this.cajaActual = caja;
        this.cargando = false;
        alert('Caja cerrada exitosamente');
      },
      error: (error) => {
        console.error('Error al cerrar caja:', error);
        this.cargando = false;
        alert('Error al cerrar la caja');
      }
    });
  }

  aprobarVenta(venta: Venta): void {
    if (!venta.id || !this.cajeroActual?.id) return;
    
    this.ventaService.aprobarVenta(venta.id.toString(), this.cajeroActual.id.toString()).subscribe({
      next: (ventaAprobada) => {
        alert('Venta aprobada exitosamente');
        this.cargarVentasPendientes();
        this.cargarResumenCaja();
      },
      error: (error) => {
        console.error('Error al aprobar venta:', error);
        alert('Error al aprobar la venta');
      }
    });
  }

  cancelarVenta(venta: Venta): void {
    if (!venta.id || !this.motivoCancelacion.trim()) {
      alert('Debe ingresar un motivo para cancelar la venta');
      return;
    }
    
    this.ventaService.cancelarVenta(venta.id.toString(), this.motivoCancelacion).subscribe({
      next: (ventaCancelada) => {
        alert('Venta cancelada exitosamente');
        this.motivoCancelacion = '';
        this.cargarVentasPendientes();
        this.cargarResumenCaja();
      },
      error: (error) => {
        console.error('Error al cancelar venta:', error);
        alert('Error al cancelar la venta');
      }
    });
  }

  actualizarFecha(): void {
    if (!this.cajaActual?.id) return;
    
    this.movimientoCajaService.getMovimientosPorFecha(
      this.cajaActual.id.toString(), 
      this.fechaFiltro
    ).subscribe({
      next: (movimientos) => {
        // Aquí puedes mostrar los movimientos del día seleccionado
        console.log('Movimientos del día:', movimientos);
      },
      error: (error) => {
        console.error('Error al cargar movimientos:', error);
      }
    });
  }

  getEstadoCajaTexto(): string {
    if (!this.cajaActual) return 'Sin caja asignada';
    
    switch (this.cajaActual.estadoCaja) {
      case 'ABIERTA': return 'Abierta';
      case 'CERRADA': return 'Cerrada';
      case 'MANTENIMIENTO': return 'En mantenimiento';
      default: return 'Desconocido';
    }
  }

  getEstadoVentaTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'APROBADA': return 'Aprobada';
      case 'CANCELADA': return 'Cancelada';
      case 'FINALIZADA': return 'Finalizada';
      default: return 'Desconocido';
    }
  }

  getEstadoVentaClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-warning';
      case 'APROBADA': return 'badge-success';
      case 'CANCELADA': return 'badge-danger';
      case 'FINALIZADA': return 'badge-info';
      default: return 'badge-secondary';
    }
  }
}
