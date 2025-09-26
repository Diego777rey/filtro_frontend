import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrarHorarioComponent } from './page/registrar-horario/registrar-horario.component';

const routes: Routes = [{path: '', component: RegistrarHorarioComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrarHorarioRoutingModule { }
