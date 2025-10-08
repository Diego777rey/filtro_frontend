import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransferenciasRoutingModule } from './transferencias-routing.module';
import { TransferenciasComponent } from './page/transferencias/transferencias.component';


@NgModule({
  declarations: [
    TransferenciasComponent
  ],
  imports: [
    CommonModule,
    TransferenciasRoutingModule
  ]
})
export class TransferenciasModule { }
