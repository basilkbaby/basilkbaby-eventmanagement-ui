import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: Date | string | number | null | undefined, format?: string): string {
    // Handle null/undefined
    if (value == null || value === undefined) {
      return 'Date not available';
    }
    
    // Default format if not provided
    const dateFormat = format || 'EEEE, MMMM d, yyyy h:mm a';
    
    // Check if it's a valid date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format using DatePipe
    return this.datePipe.transform(date, dateFormat) || 'Invalid format';
  }
}