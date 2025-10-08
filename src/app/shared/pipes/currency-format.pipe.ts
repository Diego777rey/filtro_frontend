import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe optimizado para formatear moneda
 * Reutilizable y con mejor rendimiento que formatear en cada llamada
 */
@Pipe({
  name: 'currencyFormat',
  pure: true // Pipe puro para mejor rendimiento
})
export class CurrencyFormatPipe implements PipeTransform {
  
  private static readonly CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });

  transform(amount: number): string {
    if (amount == null || isNaN(amount)) {
      return '€0,00';
    }
    
    return CurrencyFormatPipe.CURRENCY_FORMATTER.format(amount);
  }
}
