// Bounded-arc curve transform for a single seat section.
//
// Kept identical to the admin generator's applyCurveToSection
// (TicketSystem-Admin/.../core/utils/seat-generation.util.ts) so the customer seat
// map matches the admin preview/live map exactly. If the curve math changes, update BOTH.

// Maximum half-sweep (radians) at curveStrength = 100. Bounding the angle keeps the
// widest row from folding past 90° into a vertical stack at the ends.
const CURVE_PHI_CAP = 1.15;

/**
 * Bends one section's seats (and its row labels) onto a bounded arc, in place.
 * `points` and `labels` must contain ONLY the items for a single section.
 * curveStrength 0 (or falsy) is a no-op — the section stays a flat grid.
 */
export function applyCurveToSection(
  points: { cx: number; cy: number }[],
  labels: { x: number; y: number }[],
  curveStrength: number | undefined | null
): void {
  const strength = Math.max(0, Math.min(100, curveStrength || 0));
  if (strength <= 0 || points.length === 0) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity;
  for (const p of points) {
    if (p.cx < minX) minX = p.cx;
    if (p.cx > maxX) maxX = p.cx;
    if (p.cy < minY) minY = p.cy;
  }
  const centreX = (minX + maxX) / 2;
  const baseY   = minY;                       // front row (nearest the stage)
  const maxHalf = (maxX - minX) / 2;          // widest row's half-width, in px
  const phiMax  = (strength / 100) * CURVE_PHI_CAP;
  if (phiMax <= 1e-4 || maxHalf <= 0) return;
  const R0 = maxHalf / phiMax;                // radius that caps the widest row at phiMax

  const warp = (x: number, y: number): { x: number; y: number } => {
    const dx     = x - centreX;
    const rowPx  = y - baseY;
    const radius = R0 + rowPx;
    const phi    = dx / radius;
    return { x: centreX + radius * Math.sin(phi), y: baseY + rowPx - radius * (1 - Math.cos(phi)) };
  };

  for (const p of points) { const w = warp(p.cx, p.cy); p.cx = w.x; p.cy = w.y; }
  for (const l of labels) { const w = warp(l.x,  l.y);  l.x  = w.x; l.y  = w.y; }
}

/**
 * Rotates one section's seats (and its row labels) around the section's centre, in place.
 * `points` and `labels` must contain ONLY the items for a single section.
 * rotationDeg 0 (or falsy) is a no-op. Apply AFTER curve so the whole (curved) block
 * tilts as one. Kept identical to the admin generator's applyRotationToSection.
 */
export function applyRotationToSection(
  points: { cx: number; cy: number }[],
  labels: { x: number; y: number }[],
  rotationDeg: number | undefined | null
): void {
  const th = ((rotationDeg || 0) * Math.PI) / 180;
  if (th === 0 || points.length === 0) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.cx < minX) minX = p.cx; if (p.cx > maxX) maxX = p.cx;
    if (p.cy < minY) minY = p.cy; if (p.cy > maxY) maxY = p.cy;
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const cos = Math.cos(th), sin = Math.sin(th);
  const rot = (x: number, y: number): { x: number; y: number } => {
    const dx = x - cx, dy = y - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
  };

  for (const p of points) { const r = rot(p.cx, p.cy); p.cx = r.x; p.cy = r.y; }
  for (const l of labels) { const r = rot(l.x,  l.y);  l.x  = r.x; l.y  = r.y; }
}
