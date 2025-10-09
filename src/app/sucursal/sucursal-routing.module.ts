import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SucursalComponent } from './page/sucursal/sucursal.component';
import { FormulariosucursalComponent } from './page/formulariosucursal/formulariosucursal.component';
import { ReporteSucursalComponent } from './page/reportesucursal/reportesucursal.component';

const routes: Routes = [
  { path: '', component: SucursalComponent }, // lista de sucursales
  { path: 'crear', component: FormulariosucursalComponent }, // creación
  { path: 'editar/:id', component: FormulariosucursalComponent }, // edición
  { path: 'generar', component: ReporteSucursalComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SucursalRoutingModule { }
