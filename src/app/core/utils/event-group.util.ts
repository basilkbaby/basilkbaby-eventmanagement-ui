import { EventDto } from '../models/DTOs/event.DTO.model';

// A display row that may represent either a single event or a whole group (artist/tour).
export type DisplayEvent = EventDto & {
  _isGroup?: boolean;   // true when this row stands in for a group of events
  _dateCount?: number;  // number of events in the group (1 for a single event)
};

/**
 * Collapse events so each group appears once (its first event becomes the representative),
 * while ungrouped events pass through unchanged. Order is preserved.
 */
export function collapseByGroup(events: EventDto[]): DisplayEvent[] {
  const out: DisplayEvent[] = [];
  const reps = new Map<string, DisplayEvent>();

  for (const ev of events || []) {
    const gid = ev.groupId;
    if (gid) {
      const existing = reps.get(gid);
      if (existing) {
        existing._dateCount = (existing._dateCount || 1) + 1;
      } else {
        const rep: DisplayEvent = { ...ev, _isGroup: true, _dateCount: 1 };
        reps.set(gid, rep);
        out.push(rep);
      }
    } else {
      out.push(ev);
    }
  }

  return out;
}
