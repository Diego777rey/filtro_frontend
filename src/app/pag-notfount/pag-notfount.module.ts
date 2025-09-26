import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagNotfountRoutingModule } from './pag-notfount-routing.module';
import { PagNotfountComponent } from './page/pag-notfount/pag-notfount.component';


@NgModule({
  declarations: [
    PagNotfountComponent
  ],
  imports: [
    CommonModule,
    PagNotfountRoutingModule
  ]
})
export class PagNotfountModule { }
