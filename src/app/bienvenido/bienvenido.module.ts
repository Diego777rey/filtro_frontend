import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BienvenidoRoutingModule } from './bienvenido-routing.module';
import { BienvenidoComponent } from './page/bienvenido/bienvenido.component';

@NgModule({
  declarations: [
    BienvenidoComponent
  ],
  imports: [
    CommonModule,
    BienvenidoRoutingModule
  ]
})
export class BienvenidoModule { }
