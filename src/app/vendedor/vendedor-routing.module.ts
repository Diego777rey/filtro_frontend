import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendedorComponent } from './page/vendedor/vendedor.component';
import { FormulariovendedorComponent } from './page/formulariovendedor/formulariovendedor.component';
import { ReporteVendedorComponent } from './page/reportevendedor/reportevendedor.component';

const routes: Routes = [
  { path: '', component: VendedorComponent },
  { path: 'crear', component: FormulariovendedorComponent },
  { path: 'editar/:id', component: FormulariovendedorComponent },
  { path: 'generar', component: ReporteVendedorComponent } // <-- ruta para edición
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendedorRoutingModule { }
