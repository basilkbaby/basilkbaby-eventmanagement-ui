import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import { CartService }   from '../../../core/services/cart.service';
import { HeaderConfig }  from '../../../core/models/config.interface';
import { CartSummaryDto } from '../../../core/models/DTOs/cart.DTO.model';

export type HeaderTheme = 'full' | 'minimal';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  // ── All state driven by config, no @Input ──────────────────────────────────
  config:       HeaderConfig | null = null;
  activeTheme:  HeaderTheme  = 'full';
  cartItemCount = 0;
  cartSummary:  CartSummaryDto | null = null;

  isMenuOpen          = false;
  mobileOpen          = false;
  phoneCopied         = false;
  emailCopied         = false;
  contactDropdownOpen = false;
  currentRoute        = '';

  private configSub: Subscription | null = null;
  private routerSub: Subscription | null = null;
  private cartSub:   Subscription | undefined;

  constructor(
    private configService: ConfigService,
    private router:        Router,
    private cartService:   CartService
  ) {}

  // ── Convenience getters ────────────────────────────────────────────────────

  get isFull():    boolean { return this.activeTheme === 'full'; }
  get isMinimal(): boolean { return this.activeTheme === 'minimal'; }

  /** Logo text — from config.company.logo.text or company name initials */
  get logoText(): string {
    return this.config?.company?.logo?.text
        || this.config?.company?.name?.substring(0, 2).toUpperCase()
        || 'V4';
  }

  /** Logo sub-label — from config.company.logo.sublabel */
  get logoSublabel(): string {
    return this.config?.company?.logo?.sublabel || '';
  }

  /** Nav items from config */
  get menuItems() {
    return this.config?.navigation?.menuItems || [];
  }

  get contactInfo() {
    return this.config?.company?.contact || {
      phone: '', email: '', address: ''
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit() {
    // Config — drives theme + all display data
    this.configSub = this.configService.config$.subscribe(config => {
      this.config = config;
      if (config) {
        this.activeTheme = (config.theme?.headerStyle as HeaderTheme) ?? 'full';
        this.applyTheme(config);
      }
    });

    // Router — close menus on navigation, track current route
    this.currentRoute = this.router.url;
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects || e.url;
      this.isMenuOpen   = false;
      this.mobileOpen   = false;
    });

    // Cart
    this.cartSub = this.cartService.currentCartState$.subscribe({
      next: (state) => {
        this.cartItemCount = state.items.reduce((n, i) => n + i.quantity, 0);
      }
    });
  }

  ngOnDestroy() {
    this.configSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  navigateToCart():         void { this.router.navigate(['/cart']); }
  navigateToTicketLookup(): void { this.router.navigate(['/tickets/lookup']); }

  onMinimalCtaClick(): void {
    this.mobileOpen = false;
    this.navigateToTicketLookup();
  }

  /**
   * Handle nav item clicks in the minimal theme.
   * External links are handled by the <a href> in the template.
   * Internal routes: navigate directly.
   * Anchor links (#section):
   *   - If already on '/': smooth-scroll immediately.
   *   - If on another page: navigate to '/' first, then scroll once
   *     the NavigationEnd event fires.
   */
  onMinimalNavClick(item: any): void {
    this.mobileOpen = false;
    this.isMenuOpen = false;

    const link: string = item.routerLink || '';

    if (!link.startsWith('#')) return;

    const scrollToAnchor = () => {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (this.currentRoute === '/' || this.currentRoute === '') {
      // Already on home — scroll immediately
      scrollToAnchor();
    } else {
      // Navigate to home first, then scroll after navigation completes
      this.router.navigate(['/']).then(() => {
        // Give the page a tick to render before scrolling
        setTimeout(scrollToAnchor, 100);
      });
    }
  }

  // ── Full-theme helpers ─────────────────────────────────────────────────────

  toggleMenu():            void { this.isMenuOpen = !this.isMenuOpen; }
  toggleContactDropdown(): void { this.contactDropdownOpen = !this.contactDropdownOpen; }

  getHeaderClass(): string {
    return this.config?.company?.name?.toLowerCase().replace(/\s+/g, '-') ?? 'default-header';
  }

  getRouterLinkActiveOptions(item: any): any {
    return { exact: item?.routerLink === '/' };
  }

  copyToClipboard(text: string, type: 'phone' | 'email'): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'phone') { this.phoneCopied = true; setTimeout(() => this.phoneCopied = false, 2000); }
      else                  { this.emailCopied = true; setTimeout(() => this.emailCopied = false, 2000); }
    }).catch(err => console.error('Copy failed:', err));
  }

  // ── Theme application ─────────────────────────────────────────────────────

  private applyTheme(config: HeaderConfig): void {
    const s = document.documentElement.style;
    s.setProperty('--primary-color',   config.company.primaryColor);
    s.setProperty('--primary-dark',    this.darkenColor(config.company.primaryColor, 20));
    s.setProperty('--secondary-color', config.company.secondaryColor);
    s.setProperty('--accent-color',    config.company.accentColor);
    s.setProperty('--text-color',      config.theme.textColor);
    s.setProperty('--glass-bg',        config.theme.glassBackground  || 'rgba(255,255,255,0.1)');
    s.setProperty('--glass-border',    config.theme.glassBorder       || 'rgba(255,255,255,0.15)');
    // Expose header height so child pages (seatmap, cart) can size correctly
    s.setProperty('--header-h', this.activeTheme === 'minimal' ? '64px' : '80px');
    // For fixed-position navbar (minimal theme), push body content down
    document.body.style.paddingTop = this.activeTheme === 'minimal' ? '64px' : '0px';
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R   = (num >> 16)          - amt;
    const G   = (num >> 8  & 0x00FF) - amt;
    const B   = (num        & 0x0000FF) - amt;
    return '#' + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100  +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }
}