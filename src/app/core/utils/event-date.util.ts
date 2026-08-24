// Utilities for reasoning about an event landing date.
//
// The event-landing data stores dates as display strings such as
// "22nd AUGUST 2026" / "4th SEPTEMBER 2026", so we parse those here rather
// than relying on a structured ISO field.

const MONTHS: Record<string, number> = {
  JANUARY: 0, FEBRUARY: 1, MARCH: 2, APRIL: 3, MAY: 4, JUNE: 5,
  JULY: 6, AUGUST: 7, SEPTEMBER: 8, OCTOBER: 9, NOVEMBER: 10, DECEMBER: 11
};

/**
 * Parses a display date like "22nd AUGUST 2026" into a Date at local midnight.
 * Returns null if the string can't be understood.
 */
export function parseEventDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  const match = dateStr.trim().match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = MONTHS[match[2].toUpperCase()];
  const year = parseInt(match[3], 10);
  if (month === undefined || isNaN(day) || isNaN(year)) return null;

  return new Date(year, month, day);
}

/**
 * True once the event day has fully passed — i.e. from the day AFTER the
 * event date onward. On the event day itself this returns false, so tickets
 * stay available right up to (and through) show day.
 *
 * If the date can't be parsed we return false, so an unknown date never
 * hides an otherwise-valid event.
 */
export function isEventFinished(dateStr: string | null | undefined, now: Date = new Date()): boolean {
  const eventDate = parseEventDate(dateStr);
  if (!eventDate) return false;

  const endOfEventDay = new Date(
    eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(),
    23, 59, 59, 999
  );
  return now.getTime() > endOfEventDay.getTime();
}
