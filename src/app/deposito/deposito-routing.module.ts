import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepositoComponent } from './page/deposito/deposito.component';
import { FormularioDepositoComponent } from './page/formulario-deposito/formulario-deposito.component';

const routes: Routes = [
  { path: '', component: DepositoComponent },
  { path: 'crear', component: FormularioDepositoComponent },
  { path: 'editar/:id', component: FormularioDepositoComponent },
  { path: 'generar', component: DepositoComponent } // Para reportes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepositoRoutingModule { }
