import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonasComponent } from './page/personas/personas.component';
import { FormularioPersonaComponent } from './page/formulario-persona/formulario-persona.component';

const routes: Routes = [{ path: '', component: PersonasComponent },
  { path: 'crear', component: FormularioPersonaComponent },
  { path: 'editar/:id', component: FormularioPersonaComponent },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonasRoutingModule { }
