import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProveedorComponent } from './page/proveedor/proveedor.component';
import { FormularioProveedorComponent } from './page/formulario-proveedor/formulario-proveedor.component';

const routes: Routes = [
  { path: '', component: ProveedorComponent },
  { path: 'crear', component: FormularioProveedorComponent },
  { path: 'editar/:id', component: FormularioProveedorComponent } // <-- ruta para edición
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProveedorRoutingModule { }
