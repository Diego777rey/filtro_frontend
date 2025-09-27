import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CajeroRoutingModule } from './cajero-routing.module';
import { CajeroComponent } from './page/cajero/cajero.component';


@NgModule({
  declarations: [
    CajeroComponent
  ],
  imports: [
    CommonModule,
    CajeroRoutingModule
  ]
})
export class CajeroModule { }
