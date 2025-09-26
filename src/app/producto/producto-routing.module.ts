import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductoComponent } from './page/producto/producto.component';
import { ProductoFormComponent } from './page/formularioproducto/formularioproducto.component';

const routes: Routes = [
  { path: '', component: ProductoComponent },
  { path: 'crear', component: ProductoFormComponent },
  { path: 'editar/:id', component: ProductoFormComponent } // <-- ruta para edición
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductoRoutingModule { }
