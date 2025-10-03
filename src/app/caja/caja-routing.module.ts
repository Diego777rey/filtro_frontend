import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CajaComponent } from './page/caja/caja.component';
import { FormularioCajaComponent } from './page/formulario-caja/formulario-caja.component';
import { PanelCajaComponent } from './page/panel-caja/panel-caja.component';

const routes: Routes = [
  { path: '', component: CajaComponent },
  { path: 'crear', component: FormularioCajaComponent },
  { path: 'editar/:id', component: FormularioCajaComponent },
  { path: 'panel', component: PanelCajaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CajaRoutingModule { }
