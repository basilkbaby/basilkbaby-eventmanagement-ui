import { Pipe, PipeTransform } from "@angular/core";
import { VenueSectionWithLayout } from "../models/venue-section.interface";

@Pipe({ name: 'filterStanding', standalone: true })
export class FilterStandingPipe implements PipeTransform {
  transform(sections: VenueSectionWithLayout[]): VenueSectionWithLayout[] {
    return sections.filter(s => s.id.includes('standing'));
  }
}