// standing-sections.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'standingSections',
  standalone: true
})
export class StandingSectionsPipe implements PipeTransform {
  transform(sections: any[]): any[] {
    if (!sections) return [];
    return sections.filter(s => s.svgId && s.svgId.includes('standing'));
  }
}

// 