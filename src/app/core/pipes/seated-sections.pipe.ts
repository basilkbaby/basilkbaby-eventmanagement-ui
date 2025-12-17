
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'seatedSections',
  standalone: true
})
export class SeatedSectionsPipe implements PipeTransform {
  transform(sections: any[]): any[] {
    if (!sections) return [];
    return sections.filter(s => s.svgId && !s.svgId.includes('standing'));
  }
}