import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SeatService } from '../../../core/services/seat.service';
import {
  getSeatDisplayText,
  isSeatSelectable, RowNumberingType,
  Seat, SEAT_STATUS_CONFIG, SeatManagement, SeatOverride,
  SeatSectionType, SeatStatus, SectionRowConfig,
  SelectedSeat, TicketType, VenueData, VenueSection
} from '../../../core/models/seats.model';
import { SeatMapVisualComponent } from './seat-map-visual/seat-map-visual.component';
import { applyCurveToSection, applyRotationToSection, parseRowNums } from '../../../core/utils/seat-curve.util';
import { FormatDatePipe } from '../../../core/pipes/format-date.pipe';
import { NotificationService } from '../../../core/services/notification.service';
import { GeneralAdmissionComponent } from '../general-admission/general-admission.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-svg-seatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SeatMapVisualComponent, FormatDatePipe, GeneralAdmissionComponent],
  templateUrl: './svg-seatmap.component.html',
  styleUrls: ['./svg-seatmap.component.scss']
})
export class SVGSeatmapComponent implements OnInit, OnDestroy {

  @ViewChild('seatMapVisual') seatMapVisual!: SeatMapVisualComponent;

  // ── State ──────────────────────────────────────────────────────────────────
  loading          = true;
  inactive         = false; // event is hidden (inactive) and no valid preview key
  venueData!:      VenueData;
  seats:           Seat[]         = [];
  selectedSeats:   SelectedSeat[] = [];
  selectedSeatIds: string[]       = [];
  hoveredSeatId:   string | null  = null;
  eventId          = '';
  isLoading        = false;

  // ── Section filter ────────────────────────────────────────────────────────
  activeSectionId: string | null = null;

  // ── Row labels ────────────────────────────────────────────────────────────
  rowLabels: { x: number; y: number; label: string; side: 'left' | 'right' }[] = [];

  // ── Legend / status config ────────────────────────────────────────────────
  readonly seatStatusConfig = SEAT_STATUS_CONFIG;
  readonly SeatStatus       = SeatStatus;
  readonly SeatSectionType  = SeatSectionType;

  // ── GA panel ──────────────────────────────────────────────────────────────
  showGAPanel        = false;
  gaStandingSection: VenueSection | null = null;

  // ── Standing ──────────────────────────────────────────────────────────────
  private usedStandingIds: string[] = [];

  constructor(
    private cartService:         CartService,
    private seatService:         SeatService,
    private route:               ActivatedRoute,
    private router:              Router,
    private notificationService: NotificationService,
    private analytics:           AnalyticsService,
    private eventService:        EventService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.eventId = params['id'];
      // Verify the event is visible before loading seats. An inactive event
      // returns 403 unless a valid ?preview=<key> is supplied (admin preview).
      const preview = this.route.snapshot.queryParamMap.get('preview');
      this.loading = true;
      this.eventService.getEventById(this.eventId, preview).subscribe({
        next: () => this.getSeatMap(this.eventId),
        error: (err) => {
          if (err?.status === 403) {
            this.inactive = true;
            this.loading = false;
          } else {
            // Other errors (e.g. transient) shouldn't block booking — try the seat map.
            this.getSeatMap(this.eventId);
          }
        }
      });
    });
  }

  ngOnDestroy() {}

  // ── Data ──────────────────────────────────────────────────────────────────

  getSeatMap(id: string) {
    this.loading = true;
    this.seatService.getSeatMap(id).subscribe({
      next: (seatmap) => {
        this.venueData = seatmap;
        this.generateSeats();
        this.loading = false;
        this.analytics.trackPageView(this.router.url, `Seat Selection – ${seatmap.eventName}`);
      },
      error: (err)    => { this.loading = false; console.error(err); }
    });
  }

  // ── Section filter ────────────────────────────────────────────────────────

  getSections(): VenueSection[] {
    const sections = (this.venueData?.sections ?? [])
      .filter(s => s.seatSectionType !== SeatSectionType.FOH);

    // Sort by min ticket price ascending
    return sections.sort((a, b) => {
      const minPrice = (sec: VenueSection) =>
        Math.min(...(sec.rowConfigs ?? []).map(r => r.customPrice || 0).filter(p => p > 0), Infinity);
      const pa = minPrice(a), pb = minPrice(b);
      if (pa === Infinity && pb === Infinity) return 0;
      if (pa === Infinity) return 1;
      if (pb === Infinity) return -1;
      return pa - pb;
    });
  }

  setSection(id: string | null) {
    this.activeSectionId = id;
    this.seatMapVisual?.resetView();
  }

  // ── Seat generation ───────────────────────────────────────────────────────

  generateSeats() {
    this.seats = []; this.rowLabels = [];
    this.usedStandingIds = [];

    const statusMap = new Map<string, SeatOverride>();
    (['reservedSeats', 'blockedSeats', 'soldSeats', 'unavailableSeats'] as (keyof SeatManagement)[])
      .forEach(cat => this.venueData.seatManagement[cat]?.forEach(o => statusMap.set(o.seatId, o)));

    const contGen = this.createLetterGenerator();
    const defNumType = RowNumberingType.PERSECTION;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const defaultBlock = (i: number) => letters[i % 26];

    const sorted = [...this.venueData.sections].sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

    sorted.forEach(section => {
      const type = section.seatSectionType || SeatSectionType.SEAT;
      if (type === SeatSectionType.FOH) return;
      if (type === SeatSectionType.STANDING) { this.createStandingSection(section); return; }

      const seatStart  = this.seats.length;
      const labelStart = this.rowLabels.length;

      const sName       = section.name.toUpperCase();
      const rowOffset   = section.rowOffset || 0;
      const numType     = section.rowNumberingType || defNumType;
      const secSkip     = section.skipRowLetters || [];
      const rowLabelPos = new Map<string, { minX: number; maxX: number; y: number; dir: 'left'|'right'|'center'; block: string; letter: string }>();

      let colPos = 0;

      const sortedCfgs = [...(section.rowConfigs || [])].sort((a, b) => (a.fromColumn||0) - (b.fromColumn||0));

      sortedCfgs.forEach((cfg, ci) => {
        const fr = cfg.fromRow, tr = cfg.toRow;
        const fc = cfg.fromColumn || 1, tc = cfg.toColumn || section.seatsPerRow;
        const block = cfg.blockLetter || defaultBlock(ci);
        const dir: 'left'|'right'|'center' = (cfg.numberingDirection as any) || 'left';
        const gapCols  = cfg.gapColumns ? cfg.gapColumns.split(',').map((s:string)=>parseInt(s.trim())).filter((n:number)=>!isNaN(n)) : [];
        const gapSize  = cfg.gapSize || 1;
        const skip     = cfg.skipRowLetters || secSkip;

        if (ci > 0) colPos += 2;
        let perRowIdx = 0;

        // Row taper: each row going back gets `step` extra seats, centred on the block.
        const step       = Math.max(0, section.rowWidthStep || 0);
        const baseWidth  = tc - fc + 1;
        const baseCentre = colPos + (baseWidth - 1) / 2;
        // Seat numbering starts at this section's SeatStartNumber (default 1).
        const sectionStart = Math.max(1, section.seatStartNumber || 1);
        // Per-row overrides: RowSeatCounts gives each row its own width (and optionally its
        // own start number). Absent -> previous behaviour (fixed cols / taper).
        const rowCounts = parseRowNums((cfg as any).rowSeatCounts);
        const rowStarts = parseRowNums((cfg as any).rowStartNumbers);
        const shaped    = !!rowCounts;

        const seatNum = (a: number, tot: number): number => {
          if (dir === 'right') return tot - a + 1;
          if (dir === 'center') {
            const mid = tot / 2;
            if (tot % 2 === 1) {
              const ctr = Math.ceil(mid), d = Math.abs(a - ctr);
              if (a === ctr) return 1;
              return a < ctr ? d * 2 : d * 2 + 1;
            }
            const lc = Math.floor(mid), rc = Math.ceil(mid);
            return a <= lc ? (lc - a + 1) * 2 : (a - rc) * 2 + 1;
          }
          return a;
        };

        for (let r = fr; r <= tr; r++) {
          const globalRow = r + rowOffset;
          const rowLetter = numType === RowNumberingType.CONTINUOUS
            ? contGen.getNextLetter(skip)
            : this.rowLetterForIndex(perRowIdx++, skip);

          const ri = r - fr;
          const rowWidth = shaped
            ? (rowCounts![ri] > 0 ? rowCounts![ri] : baseWidth)
            : baseWidth + step * ri;
          const rowStart = shaped && rowStarts && rowStarts[ri] > 0 ? rowStarts[ri] : sectionStart;
          const rowOffsetNum = rowStart - 1;
          const shapedRow = shaped || step > 0;
          let minX = Infinity, maxX = -Infinity;

          for (let k = 0; k < rowWidth; k++) {
            // Shaped rows (per-row counts or taper) widen symmetrically around the block
            // centre; plain rows keep the original left-to-right packing (incl. column gaps).
            let cp: number;
            let sn: number;
            if (shapedRow) {
              cp = baseCentre - (rowWidth - 1) / 2 + k;
              sn = seatNum(k + 1, rowWidth) + rowOffsetNum;
            } else {
              const c = fc + k;
              const colOffset = gapCols.filter((g:number) => c > g).length * gapSize;
              cp = colPos + (c - fc) + colOffset;
              sn = seatNum(c - fc + 1, baseWidth) + rowOffsetNum;
            }

            const short  = sName.charAt(0);
            const seatId = numType === RowNumberingType.CONTINUOUS
              ? `${short}-${rowLetter}${sn}`
              : `${short}-${block}-${rowLetter}${sn}`;

            // 26 = GAP constant in seat-map-visual (SR=10, diameter=20, gap between edges=6px)
            const cx = section.x + cp * 26;
            const cy = section.y + globalRow * 26;

            minX = Math.min(minX, cx); maxX = Math.max(maxX, cx);

            const ov     = statusMap.get(seatId);
            const status = ov?.status || SeatStatus.AVAILABLE;

            this.seats.push({
              id: seatId, cx, cy, r: 8,
              rowLabel: rowLetter, seatNumber: sn,
              sectionId: section.id, sectionName: section.sectionLabel || section.name,
              sectionConfigId: cfg.id, ticketType: cfg.type,
              status, price: cfg.customPrice || 0, color: cfg.color,
              gridRow: globalRow, gridColumn: Math.round(cp) + 1,
              isStandingArea: false, originalColumn: shapedRow ? k + 1 : fc + k,
              numberingDirection: dir, blockIndex: ci,
              blockLetter: block, blockStartSeat: 1,
              blockTotalSeats: rowWidth, rowNumberingType: numType
            });
          }

          rowLabelPos.set(`${section.id}-${block}-${rowLetter}`, { minX, maxX, y: section.y + globalRow * 26, dir, block, letter: rowLetter });
        }

        if (shaped) {
          const maxW = Math.max(baseWidth, ...rowCounts!.map(n => (n > 0 ? n : 0)));
          colPos += maxW + 2;
        } else if (step > 0) {
          colPos += baseWidth + step * (tr - fr) + 2;
        } else {
          colPos += (tc - fc + 1);
          colPos += gapCols.filter((g:number) => g >= fc && g < tc).length * gapSize;
        }
      });

      rowLabelPos.forEach(pos => {
        let lx: number, side: 'left'|'right';
        if (pos.dir === 'right') { lx = pos.maxX + 15; side = 'right'; }
        else if (pos.dir === 'left') { lx = pos.minX - 15; side = 'left'; }
        else { lx = pos.block === 'R' ? pos.maxX + 15 : pos.minX - 15; side = pos.block === 'R' ? 'right' : 'left'; }
        this.rowLabels.push({ x: lx, y: pos.y + 4, label: pos.letter, side });
      });

      // Bend this section's rows onto an arc, then tilt the whole block, when configured.
      applyCurveToSection(this.seats.slice(seatStart), this.rowLabels.slice(labelStart), section.curveStrength);
      applyRotationToSection(this.seats.slice(seatStart), this.rowLabels.slice(labelStart), section.rotation);
    });
  }

  // ── Standing ──────────────────────────────────────────────────────────────

  private createStandingSection(section: VenueSection) {
    const id  = this.genStandingId(section);
    const cfg = section.rowConfigs[0] || this.defaultCfg();
    this.seats.push({
      id, cx: section.x, cy: section.y,
      r: Math.max(section.seatsPerRow, section.rows) * 26 / 4,
      rowLabel: 'ST', seatNumber: 0,
      sectionId: section.id, sectionName: section.sectionLabel || section.name,
      sectionConfigId: cfg.id, ticketType: cfg.type,
      status: SeatStatus.AVAILABLE, price: cfg.customPrice || 0, color: cfg.color,
      gridRow: section.rows, gridColumn: section.seatsPerRow,
      isStandingArea: true, blockIndex: 0, blockStartSeat: 0, blockTotalSeats: 0, blockLetter: 'A'
    });
  }

  genStandingId(section: any): string {
    const p = section.name.charAt(0).toUpperCase();
    let id: string;
    do { const n = Math.floor(Math.random() * 1000) + 1; id = `${p}-ST-${String(n).padStart(3,'0')}`; }
    while (this.usedStandingIds.includes(id));
    this.usedStandingIds.push(id);
    return id;
  }

  private defaultCfg(): SectionRowConfig {
    return { id: crypto.randomUUID(), fromRow:0, toRow:0, fromColumn:0, toColumn:0, type:'STANDING', customPrice:0, color:'#aab4c0' };
  }

  hasStandingTickets(): boolean { return this.selectedSeats.some(s => s.isStandingArea); }

  addAnotherStandingTicket() {
    const ss   = this.selectedSeats.find(s => s.isStandingArea); if (!ss) return;
    const orig = this.seats.find(s => s.id === ss.seatId);        if (!orig) return;
    const sec  = this.venueData.sections.find(s => s.id === orig.sectionId); if (!sec) return;
    const newId = this.genStandingId(sec);
    const seat: Seat = { ...orig, id: newId };
    this.selectSeat(seat);
    this.seatMapVisual?.invalidateSeat(newId);
  }

  // ── Seat events ───────────────────────────────────────────────────────────

  onSeatClicked(seat: Seat) {
    if (!isSeatSelectable(seat.status)) return;
    if (seat.isStandingArea) {
      this.gaStandingSection = this.venueData.sections.find(s => s.id === seat.sectionId) ?? null;
      this.showGAPanel = true;
      return;
    }
    seat.status === SeatStatus.SELECTED ? this.deselectSeat(seat) : this.selectSeat(seat);
    this.seatMapVisual?.invalidateSeat(seat.id);
  }

  onGABack() {
    this.showGAPanel = false;
  }

  onGASeatsSelected(seats: SelectedSeat[]) {
    seats.forEach(s => {
      this.selectedSeats.push(s);
      this.selectedSeatIds = [...this.selectedSeatIds, s.seatId];
    });
    this.showGAPanel = false;
  }

  onSeatHovered(e: { seat: Seat | null; mouseX: number; mouseY: number }) {
    this.hoveredSeatId = e.seat?.id ?? null;
  }

  onZoomed(_e: WheelEvent) {}

  // ── Selection management ──────────────────────────────────────────────────

  selectSeat(seat: Seat) {
    seat.status = SeatStatus.SELECTED;
    const selected: SelectedSeat = {
      seatId: seat.id, row: seat.rowLabel, number: seat.seatNumber,
      sectionName: seat.sectionName, sectionId: seat.sectionId,
      sectionConfigId: seat.sectionConfigId,
      tier: { id: seat.id, name: seat.ticketType, price: seat.price, color: seat.color },
      price: seat.price, features: seat.features || [],
      isStandingArea: seat.isStandingArea || false, isGeneralAdmission: false
    };
    this.selectedSeats.push(selected);
    this.selectedSeatIds = [...this.selectedSeatIds, seat.id];
    this.analytics.trackSeatSelected(selected, this.eventId, this.venueData?.eventName ?? '');
  }

  deselectSeat(seat: Seat) {
    seat.status = SeatStatus.AVAILABLE;
    const removed = this.selectedSeats.find(s => s.seatId === seat.id);
    if (removed) this.analytics.trackSeatDeselected(removed, this.eventId, this.venueData?.eventName ?? '');
    this.selectedSeats   = this.selectedSeats.filter(s => s.seatId !== seat.id);
    this.selectedSeatIds = this.selectedSeatIds.filter(id => id !== seat.id);
  }

  onRemoveSeat(seatId: string, e: MouseEvent) {
    e.stopPropagation();
    const seat = this.seats.find(s => s.id === seatId);
    if (seat) {
      this.deselectSeat(seat);
      this.seatMapVisual?.invalidateSeat(seat.id);
    } else {
      // GA ticket — not in seats array, remove directly
      this.selectedSeats   = this.selectedSeats.filter(s => s.seatId !== seatId);
      this.selectedSeatIds = this.selectedSeatIds.filter(id => id !== seatId);
    }
  }

  clearSelection() {
    [...this.selectedSeats].forEach(s => {
      const seat = this.seats.find(x => x.id === s.seatId);
      if (seat) { seat.status = SeatStatus.AVAILABLE; this.seatMapVisual?.invalidateSeat(seat.id); }
    });
    this.selectedSeats = []; this.selectedSeatIds = [];
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  addToCart() {
    if (!this.selectedSeatIds.length || this.isLoading) return;
    this.isLoading = true;
    const seatsSnapshot = [...this.selectedSeats];
    this.cartService.addToCart(this.eventId, this.selectedSeats).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.analytics.trackAddToCart(seatsSnapshot, this.eventId, this.venueData?.eventName ?? '');
          this.clearSelection();
          this.router.navigate(['/cart']);
        } else {
          this.notificationService.showError(res.error || 'Failed to add seats to cart');
        }
      },
      error: (err) => { this.isLoading = false; this.notificationService.showError(err.message || 'An error occurred'); }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getTotalPrice()  { return this.selectedSeats.reduce((t, s) => t + s.price, 0); }

  formatPrice(p: number) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p);
  }

  getUniqueTicketTiers(): { name: string; price: number; color: string }[] {
    const map = new Map<string, { name: string; price: number; color: string }>();
    this.venueData?.sections?.forEach(sec =>
      sec.rowConfigs.forEach(cfg => {
        if (cfg.type !== 'FOH' && !map.has(cfg.type))
          map.set(cfg.type, { name: cfg.type, price: cfg.customPrice || 0, color: cfg.color });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.price - b.price);
  }

  getDisplayStatuses() {
    return [SeatStatus.SELECTED, SeatStatus.BOOKED]
      .map(status => ({ status, displayText: getSeatDisplayText(status, 'GENERAL' as TicketType) }));
  }

  // ── Row letter generators ─────────────────────────────────────────────────

  private rowLetterForIndex(idx: number, skip: string[] = []): string {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', s = skip.map(l => l.toUpperCase());
    let found = -1, cur = 0;
    while (found < idx) {
      const l = cur < 26 ? A[cur] : (() => {
        const d = cur - 26, f = Math.floor(d/26), e = d % 26;
        return f >= 26 ? null : `${A[f]}${A[e]}`;
      })();
      if (!l) return `Row${idx+1}`;
      if (!s.includes(l)) { found++; if (found === idx) return l; }
      cur++; if (cur > 1000) return `Row${idx+1}`;
    }
    return `Row${idx+1}`;
  }

  private createLetterGenerator() {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let si = 0, di = 0;
    return {
      getNextLetter: (skip: string[] = []) => {
        const s = skip.map(l => l.toUpperCase());
        while (true) {
          let l: string | null;
          if (si < 26) { l = A[si]; si++; }
          else {
            const f = Math.floor(di/26), e = di % 26;
            l = f >= 26 ? null : `${A[f]}${A[e]}`; di++;
          }
          if (!l) return `Row${si+di}`;
          if (!s.includes(l)) return l;
          if (si + di > 1000) return `Row${si+di}`;
        }
      }
    };
  }
}