import {
  Component, ElementRef, ViewChild, Input, Output, EventEmitter,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Seat, VenueData, SeatStatus, SeatSectionType,
  getSeatColor, getSeatStatusConfig, getSeatDisplayText, TicketType
} from '../../../../core/models/seats.model';

export interface TooltipData {
  seat:    Seat;
  // Position in CSS pixels relative to the host element
  // Always anchored above the seat circle, not the mouse pointer
  x: number;
  y: number;
  // which direction the arrow points
  above: boolean;
}

@Component({
  selector: 'app-seat-map-visual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-map-visual.component.html',
  styleUrls: ['./seat-map-visual.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatMapVisualComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hostEl')   hostRef!:   ElementRef<HTMLDivElement>;

  @Input() venueData!:       VenueData;
  @Input() seats:            Seat[]   = [];
  @Input() selectedSeatIds:  string[] = [];
  @Input() hoveredSeatId:    string | null = null;
  @Input() rowLabels:        { x: number; y: number; label: string; side: 'left' | 'right' }[] = [];
  @Input() activeSectionId:  string | null = null;

  @Output() seatClicked = new EventEmitter<Seat>();
  @Output() seatHovered = new EventEmitter<{ seat: Seat | null; mouseX: number; mouseY: number }>();
  @Output() zoomed      = new EventEmitter<WheelEvent>();

  readonly SeatStatus      = SeatStatus;
  readonly SeatSectionType = SeatSectionType;

  // Canvas
  private ctx!:   CanvasRenderingContext2D;
  private dpr   = window.devicePixelRatio || 1;
  private rafId: number | null = null;
  private dirty = true;

  // Pan / zoom
  private panX = 0;
  private panY = 0;
  private zoom = 0.72;

  // Mouse pan
  private mouseDown = false;
  private didPan    = false;
  private mDownX    = 0;
  private mDownY    = 0;
  private panSX     = 0;
  private panSY     = 0;

  // Touch
  private touches:   Touch[] = [];
  private tPanSX     = 0;
  private tPanSY     = 0;
  private tPanOX     = 0;
  private tPanOY     = 0;
  private pinchDist0 = 0;
  private pinchZoom0 = 1;
  private pinchOX    = 0;
  private pinchOY    = 0;
  // Tap vs pan: track whether finger moved since touchstart
  private tTapStartX    = 0;
  private tTapStartY    = 0;
  private tDidMove      = false;
  private tWasMultiTouch = false;  // true if 2+ fingers were ever used this gesture

  // Hover
  private hoverRaf:  number | null = null;
  private pendingMX  = 0;
  private pendingMY  = 0;
  private hasPending = false;
  private hoveredSeat: Seat | null = null;

  // Tooltip — anchored to seat, not mouse
  tooltip: TooltipData | null = null;

  // Caches
  private selectedSet = new Set<string>();
  private colorCache  = new Map<string, string>();
  private sectionBounds = new Map<string, { minX: number; maxX: number; minY: number; maxY: number }>();

  // Hover animation
  private hoverProg:   Map<string, number> = new Map();
  private prevHoverId: string | null = null;

  // Colors
  private readonly SEL_COLOR = '#22C55E';
  private readonly SEL_RING  = 'rgba(34,197,94,0.20)';
  private readonly SEL_GLOW  = 'rgba(34,197,94,0.22)';

  // Layout — SR is seat radius, GAP is centre-to-centre spacing
  // GAP must be > SR*2 to leave visible space between seats.
  // SR=10, GAP=26 → gap between edges = 26 - 20 = 6px (visible at normal zoom)
  private readonly SR       = 10;
  private readonly GAP      = 26;   // used for rendering; parent generates cx/cy with 22px steps — we correct below
  private readonly STAGE_W  = 540;
  private readonly STAGE_H  = 56;
  private readonly CANVAS_W = 1400;
  private readonly CANVAS_H = 1200;

  // Tooltip dimensions (for layout calculation)
  private readonly TT_W  = 188;
  private readonly TT_H  = 62;   // no button — price, seat ref, status only

  private ro!: ResizeObserver;

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnChanges(ch: SimpleChanges) {
    if (ch['selectedSeatIds']) this.selectedSet = new Set(this.selectedSeatIds);
    if (ch['seats']) {
      this.rebuildCaches();
      // Auto-fit when seats first arrive — use double RAF to ensure
      // the canvas has been sized by the browser layout engine
      if (!ch['seats'].previousValue || ch['seats'].previousValue.length === 0) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          this.sizeCanvas();
          this.centreView();
          this.scheduleRender();
        }));
        // Fallback: re-centre after layout is fully settled
        setTimeout(() => { this.sizeCanvas(); this.centreView(); this.scheduleRender(); }, 120);
      }
    }
    this.scheduleRender();
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx    = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    this.ctx = ctx;

    this.sizeCanvas();
    this.centreView();
    this.rebuildCaches();

    this.zone.runOutsideAngular(() => {
      this.ro = new ResizeObserver(() => { this.sizeCanvas(); this.centreView(); this.scheduleRender(); });
      this.ro.observe(this.hostRef.nativeElement);

      canvas.addEventListener('mousemove',   this.onMM,  { passive: true });
      canvas.addEventListener('mouseleave',  this.onML,  { passive: true });
      canvas.addEventListener('mousedown',   this.onMD,  { passive: true });
      canvas.addEventListener('mouseup',     this.onMU,  { passive: true });
      canvas.addEventListener('click',       this.onMC);
      canvas.addEventListener('wheel',       this.onW,   { passive: false });
      canvas.addEventListener('touchstart',  this.onTS,  { passive: false });
      canvas.addEventListener('touchmove',   this.onTM,  { passive: false });
      canvas.addEventListener('touchend',    this.onTE,  { passive: true });
      canvas.addEventListener('touchcancel', this.onTE,  { passive: true });

      this.startLoop();
    });
  }

  ngOnDestroy() {
    if (this.rafId)    cancelAnimationFrame(this.rafId);
    if (this.hoverRaf) cancelAnimationFrame(this.hoverRaf);
    this.ro?.disconnect();
    const c = this.canvasRef?.nativeElement;
    if (c) {
      c.removeEventListener('mousemove',   this.onMM);
      c.removeEventListener('mouseleave',  this.onML);
      c.removeEventListener('mousedown',   this.onMD);
      c.removeEventListener('mouseup',     this.onMU);
      c.removeEventListener('click',       this.onMC);
      c.removeEventListener('wheel',       this.onW);
      c.removeEventListener('touchstart',  this.onTS);
      c.removeEventListener('touchmove',   this.onTM);
      c.removeEventListener('touchend',    this.onTE);
      c.removeEventListener('touchcancel', this.onTE);
    }
  }

  // ── Canvas sizing & centring ───────────────────────────────────────────────

  private sizeCanvas() {
    const host = this.hostRef.nativeElement;
    const c    = this.canvasRef.nativeElement;
    const dpr  = window.devicePixelRatio || 1;
    this.dpr   = dpr;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    c.width  = w * dpr; c.height = h * dpr;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    this.dirty = true;
  }

  private centreView() {
    const host = this.hostRef.nativeElement;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;

    const pool = this.seats.length ? this.seats : null;
    if (pool && pool.length > 0) {
      // Account for standing-area boxes (cx/cy is top-left, not centre)
      let minX =  Infinity, maxX = -Infinity;
      let minY = 10,        maxY = -Infinity;
      for (const s of pool) {
        if (s.isStandingArea) {
          const bw = (s.gridColumn ?? 1) * this.GAP;
          const bh = (s.gridRow    ?? 1) * (this.GAP - 1);
          minX = Math.min(minX, s.cx);
          maxX = Math.max(maxX, s.cx + bw);
          maxY = Math.max(maxY, s.cy + bh);
        } else {
          minX = Math.min(minX, s.cx);
          maxX = Math.max(maxX, s.cx);
          maxY = Math.max(maxY, s.cy + this.SR * 2);
        }
      }

      const contentW = maxX - minX + this.SR * 4;
      const contentH = maxY - minY + this.SR * 4;
      const pad = 40;
      const zx = (w - pad * 2) / contentW;
      const zy = (h - pad * 2) / contentH;
      this.zoom = Math.max(0.2, Math.min(1.4, Math.min(zx, zy)));
      this.panX = pad + (w - pad * 2 - contentW * this.zoom) / 2 - (minX - this.SR * 2) * this.zoom;
      this.panY = pad + (h - pad * 2 - contentH * this.zoom) / 2 - minY * this.zoom;
    } else {
      this.zoom = 0.72;
      this.panX = (w - this.CANVAS_W * this.zoom) / 2;
      this.panY = Math.max(16, (h - this.CANVAS_H * this.zoom) / 2);
    }
    this.dirty = true;
  }

  // ── Render loop ────────────────────────────────────────────────────────────

  private startLoop() {
    let prev = performance.now();
    const loop = (now: number) => {
      this.rafId = requestAnimationFrame(loop);
      const dt   = Math.min((now - prev) / 16.67, 3);
      prev = now;
      let need = this.dirty;

      if (this.hoveredSeat) {
        const id  = this.hoveredSeat.id;
        const cur = this.hoverProg.get(id) ?? 0;
        const nxt = Math.min(1, cur + 0.14 * dt);
        if (nxt !== cur) { this.hoverProg.set(id, nxt); need = true; }
      }
      if (this.prevHoverId && this.prevHoverId !== this.hoveredSeat?.id) {
        const cur = this.hoverProg.get(this.prevHoverId) ?? 0;
        const nxt = Math.max(0, cur - 0.16 * dt);
        this.hoverProg.set(this.prevHoverId, nxt);
        if (nxt > 0) need = true;
        else { this.hoverProg.delete(this.prevHoverId); this.prevHoverId = null; }
      }

      if (need) { this.render(); this.dirty = false; }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private scheduleRender() { this.dirty = true; }

  // ── Render ─────────────────────────────────────────────────────────────────

  private render() {
    if (!this.ctx) return;
    const ctx = this.ctx, c = this.canvasRef.nativeElement;
    ctx.resetTransform();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    // Crisp rendering — smoothing causes blur on circles at non-integer zoom levels
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(this.dpr * this.zoom, 0, 0, this.dpr * this.zoom, this.panX * this.dpr, this.panY * this.dpr);
    this.drawStage(ctx);
    this.drawSectionLabels(ctx);
    this.drawRowLabels(ctx);
    this.drawFOH(ctx);
    this.drawSeats(ctx);
  }

  // ── Stage ──────────────────────────────────────────────────────────────────

  private drawStage(ctx: CanvasRenderingContext2D) {
    const x = (this.CANVAS_W - this.STAGE_W) / 2, y = 10;
    const w = this.STAGE_W, h = this.STAGE_H;

    // Dark filled card
    ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
    ctx.fillStyle   = '#1e293b';
    this.rrect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.shadowColor = 'transparent';

    // Subtle inner border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    this.rrect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 10); ctx.stroke();

    // Label
    ctx.fillStyle    = 'rgba(255,255,255,0.85)';
    ctx.font         = `700 13px "DM Sans","Helvetica Neue",sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText('STAGE', x + w / 2, y + h / 2 + 1);
    ctx.letterSpacing = '0px';
  }

  // ── Section labels ─────────────────────────────────────────────────────────
  // World space — NO resetTransform. Same transform as seats, so zoom/pan is identical.

  private drawSectionLabels(ctx: CanvasRenderingContext2D) {
    if (!this.venueData?.sections) return;

    const FONT_W = 14;          // world px — ~10px on screen at zoom 0.72
    const PH_W   = FONT_W + 8; // pill height in world px
    const PX_W   = 8;          // horizontal padding in world px
    const GAP_W  = 4;          // gap above top of seat circle in world px

    ctx.font         = `600 ${FONT_W}px "DM Sans","Helvetica Neue",sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (const sec of this.venueData.sections) {
      if (sec.seatSectionType === SeatSectionType.FOH ||
          sec.seatSectionType === SeatSectionType.STANDING) continue;

      const label = (sec.sectionLabel || sec.name).toUpperCase();
      const cx    = sec.x + (sec.seatsPerRow * 26) / 2;
      const cy    = sec.y - this.SR - GAP_W - PH_W / 2;
      const tw    = ctx.measureText(label).width;

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      this.rrect(ctx, cx - tw/2 - PX_W, cy - PH_W/2, tw + PX_W*2, PH_W, 4);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillText(label, cx, cy);
    }
  }

  // ── Row labels ─────────────────────────────────────────────────────────────
  // Draw in screen space. Font scales with zoom so A-Z letters grow on zoom-in.

  // ── Row labels — world space, scales with zoom like seats ─────────────────
  private drawRowLabels(ctx: CanvasRenderingContext2D) {
    if (this.zoom < 0.45) return;

    const FONT_W = 12;   // world px — ~9px on screen at zoom 0.72
    const opacity = Math.min(1, (this.zoom - 0.45) / 0.20);

    ctx.font         = `500 ${FONT_W}px "DM Sans","Helvetica Neue",sans-serif`;
    ctx.globalAlpha  = opacity;
    ctx.fillStyle    = '#64748b';
    ctx.textBaseline = 'middle';

    for (const rl of this.rowLabels) {
      ctx.textAlign = rl.side === 'left' ? 'right' : 'left';
      ctx.fillText(rl.label, rl.x, rl.y);
    }

    ctx.globalAlpha = 1;
  }

  // ── FOH ────────────────────────────────────────────────────────────────────

  private drawFOH(ctx: CanvasRenderingContext2D) {
    if (!this.venueData?.sections) return;
    for (const sec of this.venueData.sections) {
      if (sec.seatSectionType !== SeatSectionType.FOH) continue;
      const x = sec.x, y = sec.y - 20;
      const w = sec.seatsPerRow * this.GAP, h = sec.rows * this.GAP;
      ctx.fillStyle = '#f5f6fa';
      this.rrect(ctx, x, y, w, h, 6); ctx.fill();
      ctx.setLineDash([4,4]); ctx.strokeStyle = '#cdd3de'; ctx.lineWidth = 1;
      this.rrect(ctx, x, y, w, h, 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#a0aab8'; ctx.font = `600 10px "DM Sans",sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('FOH', x + w/2, y + h/2);
    }
  }

  // ── Seats ──────────────────────────────────────────────────────────────────

  private drawSeats(ctx: CanvasRenderingContext2D) {
    const pool = this.activeSectionId
      ? this.seats.filter(s => s.sectionId === this.activeSectionId)
      : this.seats;

    const selected: Seat[] = [];
    for (const seat of pool) {
      if (seat.isStandingArea) { this.drawStanding(ctx, seat); continue; }
      if (this.selectedSet.has(seat.id)) { selected.push(seat); continue; }
      this.drawOneSeat(ctx, seat);
    }
    for (const seat of selected) this.drawOneSeat(ctx, seat);
  }

  private drawOneSeat(ctx: CanvasRenderingContext2D, seat: Seat) {
    if (seat.status === SeatStatus.UNAVAILABLE) return;
    const SR    = this.SR;
    const isSel = this.selectedSet.has(seat.id);
    // Frontend: treat BLOCKED same as BOOKED — one less status for customers to decode
    const displayStatus = seat.status === SeatStatus.BLOCKED ? SeatStatus.BOOKED : seat.status;
    const cfg   = getSeatStatusConfig(displayStatus);
    const prog  = this.hoverProg.get(seat.id) ?? 0;
    const eased = prog < 0.5 ? 2*prog*prog : 1 - Math.pow(-2*prog+2, 2)/2;
    const scale = 1 + eased * 0.13;

    ctx.globalAlpha = cfg.opacity;

    if (scale !== 1) {
      ctx.save();
      ctx.translate(seat.cx, seat.cy);
      ctx.scale(scale, scale);
      ctx.translate(-seat.cx, -seat.cy);
    }

    // Selection glow ring
    if (isSel) {
      ctx.beginPath();
      ctx.arc(seat.cx, seat.cy, SR + 5, 0, Math.PI * 2);
      ctx.fillStyle = this.SEL_RING;
      ctx.fill();
    }

    // Main circle — no shadow (causes blur at non-integer zoom levels)
    const fill = isSel ? this.SEL_COLOR : (this.colorCache.get(seat.id) ?? '#d1d5db');
    ctx.beginPath();
    ctx.arc(seat.cx, seat.cy, SR, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();

    // Label — seat number only at high zoom, checkmark when selected
    ctx.globalAlpha = 1;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    if (isSel) {
      // Checkmark always visible when selected
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.round(SR * 1.05)}px "DM Sans","Helvetica Neue",sans-serif`;
      ctx.fillText('✓', seat.cx, seat.cy + 0.5);
    } else if (this.zoom >= 1.0) {
      // Seat numbers only when zoomed in enough to read comfortably
      ctx.fillStyle   = 'rgba(255,255,255,0.92)';
      ctx.font = `600 ${Math.round(SR * 0.68)}px "DM Sans","Helvetica Neue",sans-serif`;
      ctx.fillText(String(seat.seatNumber), seat.cx, seat.cy + 0.5);
    }

    if (scale !== 1) ctx.restore();
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
  }

  private drawStanding(ctx: CanvasRenderingContext2D, seat: Seat) {
    if (!seat.gridRow || !seat.gridColumn) return;
    const w     = seat.gridColumn * this.GAP;
    const h     = seat.gridRow * (this.GAP - 1);
    const isSel = this.selectedSet.has(seat.id);
    const rx    = 12;

    // Colours — neutral slate when idle, green when selected
    const bg     = isSel ? 'rgba(34,197,94,0.13)'   : 'rgba(148,163,184,0.13)';
    const border = isSel ? this.SEL_COLOR             : '#94a3b8';
    const inner  = isSel ? 'rgba(255,255,255,0.10)'  : 'rgba(255,255,255,0.55)';
    const label  = isSel ? this.SEL_COLOR             : '#475569';
    const hint   = isSel ? this.SEL_COLOR             : '#94a3b8';

    // Background
    ctx.shadowColor = 'rgba(0,0,0,0.07)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.fillStyle   = bg;
    this.rrect(ctx, seat.cx, seat.cy, w, h, rx); ctx.fill();
    ctx.shadowColor = 'transparent';

    // Border
    ctx.strokeStyle = border; ctx.lineWidth = isSel ? 2 : 1.5;
    this.rrect(ctx, seat.cx, seat.cy, w, h, rx); ctx.stroke();

    // Inner highlight (stage-style)
    ctx.strokeStyle = inner; ctx.lineWidth = 1;
    this.rrect(ctx, seat.cx + 1, seat.cy + 1, w - 2, h - 2, rx - 1); ctx.stroke();

    const cx = seat.cx + w / 2, cy = seat.cy + h / 2;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Section name
    ctx.fillStyle    = label;
    ctx.font         = `700 14px "DM Sans","Helvetica Neue",sans-serif`;
    ctx.letterSpacing = '1.5px';
    ctx.fillText((seat.sectionName || 'STANDING').toUpperCase(), cx, cy - 12);
    ctx.letterSpacing = '0px';

    // Hint pill / selected label
    if (!isSel) {
      const hintTxt = '+ Click to select standing ticket';
      ctx.font      = `500 9.5px "DM Sans","Helvetica Neue",sans-serif`;
      const tw      = ctx.measureText(hintTxt).width;
      const pw = tw + 16, ph = 16, px = cx - pw / 2, py = cy + 4;
      ctx.globalAlpha = 0.10; ctx.fillStyle = border;
      this.rrect(ctx, px, py, pw, ph, 8); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = hint;
      ctx.fillText(hintTxt, cx, cy + 12);
    } else {
      ctx.fillStyle    = this.SEL_COLOR;
      ctx.font         = `600 10px "DM Sans","Helvetica Neue",sans-serif`;
      ctx.letterSpacing = '0.5px';
      ctx.fillText('✓ SELECTED', cx, cy + 12);
      ctx.letterSpacing = '0px';
    }
  }

  // ── Hit testing ────────────────────────────────────────────────────────────

  private hitTest(cx: number, cy: number): Seat | null {
    const canvas = this.canvasRef.nativeElement;
    const rect   = canvas.getBoundingClientRect();
    const wx = (cx - rect.left - this.panX) / this.zoom;
    const wy = (cy - rect.top  - this.panY) / this.zoom;
    const R  = this.SR + 3;   // slightly generous
    const pool = this.activeSectionId
      ? this.seats.filter(s => s.sectionId === this.activeSectionId) : this.seats;
    for (const seat of pool) {
      if (seat.isStandingArea) continue;
      if (seat.status === SeatStatus.UNAVAILABLE) continue;
      const dx = seat.cx - wx, dy = seat.cy - wy;
      if (dx*dx + dy*dy <= R*R) return seat;
    }
    for (const seat of pool) {
      if (!seat.isStandingArea || !seat.gridRow || !seat.gridColumn) continue;
      if (wx >= seat.cx && wx <= seat.cx + seat.gridColumn * this.GAP &&
          wy >= seat.cy && wy <= seat.cy + seat.gridRow    * this.GAP) return seat;
    }
    return null;
  }

  // ── Convert world seat position → screen CSS pixels ───────────────────────
  // Used to anchor the tooltip TO the seat, not to the mouse pointer

  private seatToScreen(seat: Seat): { sx: number; sy: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect   = canvas.getBoundingClientRect();
    // World → canvas CSS pixels (accounting for DPR already applied via ctx transform)
    const sx = seat.cx * this.zoom + this.panX;
    const sy = seat.cy * this.zoom + this.panY;
    return { sx, sy };
  }

  // ── Position tooltip anchored above/below the seat ─────────────────────────

  private computeTooltipPos(seat: Seat): { x: number; y: number; above: boolean } {
    const host = this.hostRef.nativeElement;
    const cw   = host.clientWidth;
    const ch   = host.clientHeight;
    const { sx, sy } = this.seatToScreen(seat);

    // Seat edge in screen pixels + arrow (7px) + breathing room (8px)
    const seatEdge = this.SR * this.zoom;
    const ARROW    = 7;
    const MARGIN   = 8;
    const CLEAR    = seatEdge + ARROW + MARGIN;   // total clearance from seat centre

    const TW = this.TT_W;
    const TH = this.TT_H;

    // Prefer above; fall back to below if not enough room
    const above = (sy - CLEAR - TH) >= 8;
    const y     = above ? sy - CLEAR - TH : sy + CLEAR;

    // Centre horizontally on seat, clamp to viewport edges
    let x = sx - TW / 2;
    x = Math.max(8, Math.min(cw - TW - 8, x));

    return { x, y, above };
  }

  // ── Mouse events ──────────────────────────────────────────────────────────

  private onMM = (e: MouseEvent) => {
    this.pendingMX = e.clientX; this.pendingMY = e.clientY; this.hasPending = true;
    if (!this.hoverRaf) {
      this.hoverRaf = requestAnimationFrame(() => {
        this.hoverRaf = null;
        if (this.hasPending) { this.hasPending = false; this.processHover(this.pendingMX, this.pendingMY); }
      });
    }
    if (this.mouseDown) {
      const dx = e.clientX - this.mDownX, dy = e.clientY - this.mDownY;
      if (!this.didPan && Math.abs(dx) + Math.abs(dy) > 4) this.didPan = true;
      if (this.didPan) { this.panX = this.panSX + dx; this.panY = this.panSY + dy; this.scheduleRender(); }
    }
    // Dynamic cursor
    const c = this.canvasRef.nativeElement;
    if (this.mouseDown) { c.style.cursor = 'grabbing'; return; }
    const seat = this.hitTest(e.clientX, e.clientY);
    if (seat && (seat.status === SeatStatus.AVAILABLE || this.selectedSet.has(seat.id))) c.style.cursor = 'pointer';
    else if (seat) c.style.cursor = 'not-allowed';
    else           c.style.cursor = 'grab';
  };

  private onML = () => {
    this.mouseDown = false;
    this.canvasRef.nativeElement.style.cursor = 'grab';
    if (this.hoveredSeat) {
      this.prevHoverId = this.hoveredSeat.id; this.hoveredSeat = null;
      this.zone.run(() => { this.tooltip = null; this.cdr.markForCheck(); });
    }
  };

  private onMD = (e: MouseEvent) => {
    if (e.button !== 0) return;
    this.mouseDown = true; this.didPan = false;
    this.mDownX = e.clientX; this.mDownY = e.clientY;
    this.panSX  = this.panX; this.panSY  = this.panY;
    this.canvasRef.nativeElement.style.cursor = 'grabbing';
  };

  private onMU = () => {
    this.mouseDown = false;
    this.canvasRef.nativeElement.style.cursor = 'grab';
  };

  private onMC = (e: MouseEvent) => {
    if (this.didPan) { this.didPan = false; return; }
    const seat = this.hitTest(e.clientX, e.clientY);
    if (seat) this.zone.run(() => this.seatClicked.emit(seat));
  };

  private onW = (e: WheelEvent) => {
    e.preventDefault();
    const canvas = this.canvasRef.nativeElement;
    const rect   = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const f  = e.deltaY < 0 ? 1.12 : 0.9;
    const nz = Math.max(0.2, Math.min(5, this.zoom * f));
    this.panX = mx - (mx - this.panX) * (nz / this.zoom);
    this.panY = my - (my - this.panY) * (nz / this.zoom);
    this.zoom = nz;
    // Update tooltip position when zoom changes and there's a hovered seat
    if (this.hoveredSeat) {
      const pos = this.computeTooltipPos(this.hoveredSeat);
      if (this.tooltip) { this.tooltip = { ...this.tooltip, ...pos }; }
    }
    this.scheduleRender();
    this.zone.run(() => this.zoomed.emit(e));
  };

  // ── Touch ─────────────────────────────────────────────────────────────────

  private onTS = (e: TouchEvent) => {
    e.preventDefault();
    this.touches = Array.from(e.touches);

    if (this.touches.length === 1) {
      this.tPanSX      = this.touches[0].clientX;
      this.tPanSY      = this.touches[0].clientY;
      this.tPanOX      = this.panX;
      this.tPanOY      = this.panY;
      this.tTapStartX  = this.touches[0].clientX;
      this.tTapStartY  = this.touches[0].clientY;
      this.tDidMove    = false;
      // Only reset multitouch flag on a fresh single-finger start with no prior touches
      if (!this.tWasMultiTouch) this.tWasMultiTouch = false;
    } else if (this.touches.length >= 2) {
      // As soon as a second finger appears, this gesture can never be a tap
      this.tDidMove        = true;
      this.tWasMultiTouch  = true;
      this.pinchDist0      = this.tDist(this.touches[0], this.touches[1]);
      this.pinchZoom0      = this.zoom;
      const mc   = this.tMid(this.touches[0], this.touches[1]);
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      this.pinchOX = mc.x - rect.left;
      this.pinchOY = mc.y - rect.top;
    }
  };

  private onTM = (e: TouchEvent) => {
    e.preventDefault();
    const ts = Array.from(e.touches);

    if (ts.length === 1 && this.touches.length === 1) {
      const dx = ts[0].clientX - this.tTapStartX;
      const dy = ts[0].clientY - this.tTapStartY;
      // 12px threshold — covers natural finger jitter on mobile
      if (!this.tDidMove && Math.sqrt(dx * dx + dy * dy) > 12) this.tDidMove = true;
      this.panX = this.tPanOX + (ts[0].clientX - this.tPanSX);
      this.panY = this.tPanOY + (ts[0].clientY - this.tPanSY);
      this.scheduleRender();
    } else if (ts.length >= 2) {
      this.tDidMove       = true;
      this.tWasMultiTouch = true;
      const dist = this.tDist(ts[0], ts[1]);
      const nz   = Math.max(0.2, Math.min(5, this.pinchZoom0 * (dist / this.pinchDist0)));
      const mc   = this.tMid(ts[0], ts[1]);
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const mx   = mc.x - rect.left, my = mc.y - rect.top;
      this.panX  = mx - (this.pinchOX - this.panX) * (nz / this.zoom);
      this.panY  = my - (this.pinchOY - this.panY) * (nz / this.zoom);
      this.zoom  = nz;
      this.pinchOX = mx;
      this.pinchOY = my;
      this.scheduleRender();
    }
    this.touches = ts;
  };

  private onTE = (e: TouchEvent) => {
    const prev = this.touches;
    this.touches = Array.from(e.touches);

    // Fire seat selection only for a clean single-finger tap:
    // - exactly one finger was down, now zero
    // - finger never moved beyond threshold
    // - no pinch/multi-touch happened at any point during this gesture
    if (prev.length === 1 && this.touches.length === 0
        && !this.tDidMove && !this.tWasMultiTouch) {
      const seat = this.hitTest(prev[0].clientX, prev[0].clientY);
      if (seat) this.zone.run(() => this.seatClicked.emit(seat));
    }

    // When all fingers lift, fully reset gesture state
    if (this.touches.length === 0) {
      this.tDidMove       = false;
      this.tWasMultiTouch = false;
    }

    // When dropping from 2 fingers to 1, reset pan origin for smooth continued pan
    if (this.touches.length === 1) {
      this.tPanSX     = this.touches[0].clientX;
      this.tPanSY     = this.touches[0].clientY;
      this.tPanOX     = this.panX;
      this.tPanOY     = this.panY;
      // Don't reset tTapStartX/Y or tDidMove here — the gesture is already tainted
    }
  };

  private tDist(a: Touch, b: Touch) { const dx = a.clientX-b.clientX, dy = a.clientY-b.clientY; return Math.sqrt(dx*dx+dy*dy); }
  private tMid(a: Touch, b: Touch)  { return { x:(a.clientX+b.clientX)/2, y:(a.clientY+b.clientY)/2 }; }

  // ── Hover ─────────────────────────────────────────────────────────────────

  private processHover(clientX: number, clientY: number) {
    const seat = this.hitTest(clientX, clientY);
    if (seat === this.hoveredSeat) return;
    if (this.hoveredSeat) this.prevHoverId = this.hoveredSeat.id;
    this.hoveredSeat = seat;

    this.zone.run(() => {
      if (seat) {
        const pos = this.computeTooltipPos(seat);
        this.tooltip = { seat, ...pos };
        this.seatHovered.emit({ seat, mouseX: clientX, mouseY: clientY });
      } else {
        this.tooltip = null;
        this.seatHovered.emit({ seat: null, mouseX: 0, mouseY: 0 });
      }
      this.cdr.markForCheck();
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  invalidateSeat(id: string) {
    const seat = this.seats.find(s => s.id === id);
    if (seat) { this.colorCache.set(id, getSeatColor(seat)); this.scheduleRender(); }
  }

  zoomIn()    { this.applyZoom(1.25); }
  zoomOut()   { this.applyZoom(0.8);  }
  resetView() { this.centreView(); this.scheduleRender(); }

  fitView() {
    if (!this.seats.length) { this.resetView(); return; }
    const pool = this.activeSectionId ? this.seats.filter(s => s.sectionId === this.activeSectionId) : this.seats;
    const minX = Math.min(...pool.map(s => s.cx)) - this.SR * 3;
    const maxX = Math.max(...pool.map(s => s.cx)) + this.SR * 3;
    const minY = Math.min(...pool.map(s => s.cy)) - this.SR * 3;
    const maxY = Math.max(...pool.map(s => s.cy)) + this.SR * 3;
    const host = this.hostRef.nativeElement;
    const vw = host.clientWidth, vh = host.clientHeight;
    const pad = 48;
    this.zoom  = Math.max(0.2, Math.min(4, Math.min((vw-pad*2)/(maxX-minX), (vh-pad*2)/(maxY-minY))));
    this.panX  = pad + (vw-pad*2-(maxX-minX)*this.zoom)/2 - minX*this.zoom;
    this.panY  = pad + (vh-pad*2-(maxY-minY)*this.zoom)/2 - minY*this.zoom;
    this.scheduleRender();
  }

  private applyZoom(f: number) {
    const host = this.hostRef.nativeElement;
    const cx = host.clientWidth/2, cy = host.clientHeight/2;
    const nz = Math.max(0.2, Math.min(5, this.zoom * f));
    this.panX = cx - (cx - this.panX) * (nz / this.zoom);
    this.panY = cy - (cy - this.panY) * (nz / this.zoom);
    this.zoom = nz; this.scheduleRender();
  }

  // ── Template helpers ───────────────────────────────────────────────────────

  getSeatFill(seat: Seat) { return this.selectedSet.has(seat.id) ? this.SEL_COLOR : (this.colorCache.get(seat.id) ?? '#d1d5db'); }
  isAvail(s: Seat)  { return s.status === SeatStatus.AVAILABLE && !this.selectedSet.has(s.id); }
  isSel(s: Seat)    { return this.selectedSet.has(s.id); }
  isTaken(s: Seat)  { return s.status === SeatStatus.BOOKED || s.status === SeatStatus.RESERVED || s.status === SeatStatus.BLOCKED; }
  getStatusText(s: Seat) {
    // Show blocked as booked to frontend users
    const displayStatus = s.status === SeatStatus.BLOCKED ? SeatStatus.BOOKED : s.status;
    return getSeatDisplayText(displayStatus, s.ticketType);
  }
  onTooltipClick(seat: Seat, e: MouseEvent) { e.stopPropagation(); this.seatClicked.emit(seat); }
  fmt(p: number) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p); }

  private rebuildCaches() {
    this.colorCache.clear();
    for (const s of this.seats) {
      // Frontend shows BLOCKED seats as BOOKED — customer doesn't need to know why
      const displaySeat = s.status === SeatStatus.BLOCKED
        ? { ...s, status: SeatStatus.BOOKED }
        : s;
      this.colorCache.set(s.id, getSeatColor(displaySeat));
    }

    // Cache per-section bounding box — used by section label drawing
    this.sectionBounds.clear();
    for (const s of this.seats) {
      const b = this.sectionBounds.get(s.sectionId);
      if (!b) {
        this.sectionBounds.set(s.sectionId, { minX: s.cx, maxX: s.cx, minY: s.cy, maxY: s.cy });
      } else {
        if (s.cx < b.minX) b.minX = s.cx;
        if (s.cx > b.maxX) b.maxX = s.cx;
        if (s.cy < b.minY) b.minY = s.cy;
        if (s.cy > b.maxY) b.maxY = s.cy;
      }
    }
    this.scheduleRender();
  }

  private rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    r = Math.min(r, w/2, h/2); ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }

  // Same path helper but intended for use in screen-space (after resetTransform)
  private rrectScreen(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    this.rrect(ctx, x, y, w, h, r);
  }

  private sectionCX(sec: any): number {
    const ss = this.seats.filter(s => s.sectionId === sec.id);
    if (!ss.length) return sec.x + (sec.seatsPerRow * this.GAP / 2);
    return (Math.min(...ss.map(s => s.cx)) + Math.max(...ss.map(s => s.cx))) / 2;
  }
}