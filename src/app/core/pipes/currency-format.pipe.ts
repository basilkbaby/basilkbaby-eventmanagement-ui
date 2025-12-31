import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    price: number | null | undefined, 
    currency: string = 'GBP', 
    locale: string = 'en-GB',
    decimalPlaces: number = 2,
    showDecimal: boolean = true  // New parameter
  ): string {
    if (price === null || price === undefined || isNaN(price)) {
      return 'Price Varies';
    }
    
    // If showDecimal is false, set decimal places to 0
    const minFractionDigits = showDecimal ? decimalPlaces : 0;
    const maxFractionDigits = showDecimal ? decimalPlaces : 0;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits
    }).format(price);
  }
}