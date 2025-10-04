import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovimientosCajaComponent } from './page/movimientos-caja/movimientos-caja.component';
import { FormularioMovimientosComponent } from './page/formulario-movimientos/formulario-movimientos.component';
import { VentasPendientesComponent } from './page/ventas-pendientes/ventas-pendientes.component';
import { EditarMovimientoComponent } from './page/editar-movimiento/editar-movimiento.component';

const routes: Routes = [
  {
    path: '',
    component: MovimientosCajaComponent
  },
  {
    path: 'nuevo',
    component: FormularioMovimientosComponent
  },
  {
    path: 'editar/:id',
    component: EditarMovimientoComponent
  },
  {
    path: 'ventas-pendientes',
    component: VentasPendientesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosCajaRoutingModule { }
