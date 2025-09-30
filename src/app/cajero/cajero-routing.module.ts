import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CajeroComponent } from './page/cajero/cajero.component';
import { FormularioCajeroComponent } from './page/formulario-cajero/formulario-cajero.component';
import { ReporteCajeroComponent } from './page/reporte-cajero/reporte-cajero.component';

const routes: Routes = [
  { path: '', component: CajeroComponent },
  { path: 'crear', component: FormularioCajeroComponent },
  { path: 'editar/:id', component: FormularioCajeroComponent },
  { path: 'generar', component: ReporteCajeroComponent } // <-- ruta para edición
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CajeroRoutingModule { }
