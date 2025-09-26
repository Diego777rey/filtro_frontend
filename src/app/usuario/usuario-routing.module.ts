import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioComponent } from './page/usuario/usuario.component';
import { FormulariousuarioComponent } from './page/formulariousuario/formulariousuario.component';

const routes: Routes = [
  { path: '', component: UsuarioComponent },
  { path: 'crear', component: FormulariousuarioComponent },
  { path: 'editar/:id', component: FormulariousuarioComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
