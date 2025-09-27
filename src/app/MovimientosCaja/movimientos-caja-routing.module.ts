import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovimientosCajaComponent } from './page/movimientos-caja/movimientos-caja.component';

const routes: Routes = [{
  path: '',
  component: MovimientosCajaComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosCajaRoutingModule { }
