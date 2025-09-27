import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProveedorRoutingModule } from './proveedor-routing.module';
import { ProveedorComponent } from './page/proveedor/proveedor.component';
import { FormularioProvedorComponent } from './page/formulario-provedor/formulario-provedor.component';
import { FormularioProveedorComponent } from './page/formulario-proveedor/formulario-proveedor.component';


@NgModule({
  declarations: [
    ProveedorComponent,
    FormularioProvedorComponent,
    FormularioProveedorComponent
  ],
  imports: [
    CommonModule,
    ProveedorRoutingModule
  ]
})
export class ProveedorModule { }
