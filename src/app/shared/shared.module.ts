import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';

/**
 * Módulo compartido para utilidades reutilizables
 * Centraliza pipes, directivas y servicios comunes
 */
@NgModule({
  declarations: [
    CurrencyFormatPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CurrencyFormatPipe
  ]
})
export class SharedModule { }
