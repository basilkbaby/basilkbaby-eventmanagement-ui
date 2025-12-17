import { Pipe, PipeTransform } from "@angular/core";
import { VenueSectionWithLayout } from "../models/venue-section.interface";

@Pipe({ name: 'filterSeated', standalone: true })
export class FilterSeatedPipe implements PipeTransform {
  transform(sections: VenueSectionWithLayout[]): VenueSectionWithLayout[] {
    return sections.filter(s => !s.id.includes('standing'));
  }
}
