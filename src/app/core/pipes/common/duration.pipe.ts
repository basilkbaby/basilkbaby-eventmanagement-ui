// duration.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '';
    
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    
    if (!start || !end) return '';
    
    let totalMinutes = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);
    
    // Handle next day
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Clean formatting
    if (hours === 0 && minutes === 0) return '0 min';
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
  }
  
  private parseTime(time: string): { hours: number, minutes: number } | null {
    const parts = time.split(':');
    if (parts.length < 2) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    return { hours, minutes };
  }
}