import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BienvenidoRoutingModule } from './bienvenido-routing.module';
import { BienvenidoComponent } from './page/bienvenido/bienvenido.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    BienvenidoComponent
  ],
  imports: [
    CommonModule,
    BienvenidoRoutingModule,
    MatCardModule,
    MatIconModule
  ]
})
export class BienvenidoModule { }
