import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MovimientosCajaRoutingModule } from './movimientos-caja-routing.module';
import { MovimientosCajaComponent } from './page/movimientos-caja/movimientos-caja.component';
import { FormularioMovimientosComponent } from './page/formulario-movimientos/formulario-movimientos.component';


@NgModule({
  declarations: [
    MovimientosCajaComponent,
    FormularioMovimientosComponent
  ],
  imports: [
    CommonModule,
    MovimientosCajaRoutingModule
  ]
})
export class MovimientosCajaModule { }
