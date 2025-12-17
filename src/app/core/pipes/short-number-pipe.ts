// short-number.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) return '0';
    
    if (value < 1000) {
      return value.toString();
    } else if (value < 1000000) {
      return (value / 1000).toFixed(1) + 'K';
    } else {
      return (value / 1000000).toFixed(1) + 'M';
    }
  }
}