import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentasComponent } from './page/ventas/ventas.component';
import { FormularioventasComponent } from './page/formularioventas/formularioventas.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: VentasComponent, canActivate: [AuthGuard] },
  { path: 'crear', component: FormularioventasComponent, canActivate: [AuthGuard] },
  { path: 'editar/:id', component: FormularioventasComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule {}
