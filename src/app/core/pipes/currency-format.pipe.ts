// shared/pipes/currency-format.pipe.ts
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
    decimalPlaces: number = 2
  ): string {
    if (price === null || price === undefined || isNaN(price)) {
      return 'Price Varies';
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(price);
  }
}