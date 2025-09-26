import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteComponent } from './page/cliente/cliente.component';
import { FormularioclienteComponent } from './page/formulariocliente/formulariocliente.component';
import { ReporteclienteComponent } from './page/reportecliente/reportecliente.component';

const routes: Routes = [
  { path: '', component: ClienteComponent },             // listado
  { path: 'crear', component: FormularioclienteComponent }, // crear cliente
  { path: 'editar/:id', component: FormularioclienteComponent },
  { path: 'generar', component: ReporteclienteComponent }, // editar cliente
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule {}
