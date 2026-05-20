// time-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: true
})
export class FormatTimePipe implements PipeTransform {
  transform(timeString: string | null | undefined): string {
    if (!timeString) return '';

    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        const h24 = parseInt(parts[0], 10);
        const min = parts[1].padStart(2, '0');
        if (isNaN(h24)) return timeString;
        const period = h24 >= 12 ? 'PM' : 'AM';
        const h12   = h24 % 12 || 12;
        return `${h12}:${min} ${period}`;
      }
    }

    return timeString;
  }
}