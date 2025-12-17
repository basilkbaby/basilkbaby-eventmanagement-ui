import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import { CartService, CartSummary } from '../../../core/services/cart.service'; // Import CartService
import { HeaderConfig } from '../../../core/models/config.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  cartItemCount = 0;
  cartSummary: CartSummary | null = null; // Add cart summary
  config: HeaderConfig | null = null;
  
  // Copy feedback states
  phoneCopied = false;
  emailCopied = false;
  
  // Contact dropdown state
  contactDropdownOpen = false;
  
  // Track current route for manual active state checking
  currentRoute = '';

  private configSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null; // Add cart subscription

  constructor(
    private configService: ConfigService, 
    private router: Router,
    private cartService: CartService // Inject CartService
  ) {}

  ngOnInit() {
    this.configSubscription = this.configService.config$.subscribe(config => {
      this.config = config;
      if (config) {
        this.applyTheme(config);
      }
    });

    // Subscribe to router events to track current route
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
      this.isMenuOpen = false; // Close mobile menu on navigation
    });

    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.updateCartInfo();
    });

    // Initialize current route
    this.currentRoute = this.router.url;
    
    // Initialize cart info
    this.updateCartInfo();
  }

  ngOnDestroy() {
    this.configSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe(); // Unsubscribe from cart
  }

  // Method to update cart information
  updateCartInfo(): void {
    this.cartItemCount = this.cartService.getItemCount();
    this.cartSummary = this.cartService.getCartSummary();
  }

  // Get cart item count for display
  getCartCount(): number {
    return this.cartItemCount;
  }

  // Check if cart has items
  hasCartItems(): boolean {
    return !this.cartService.isEmpty();
  }

  // Navigate to cart page
  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  // Clear cart (optional - you might want this in a separate cart component)
  clearCart(): void {
    this.cartService.clearCart();
  }

  // Get formatted total price
  getFormattedTotal(): string {
    if (!this.cartSummary) return '£0.00';
    return `£${this.cartSummary.total.toFixed(2)}`;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Helper method to check if a route is active for config-based menu items
  isMenuItemActive(routerLink: string): boolean {
    if (!routerLink) return false;
    
    if (routerLink === '/') {
      return this.currentRoute === '/';
    }
    
    // Special handling for events routes
    if (routerLink === '/events') {
      return this.currentRoute.startsWith('/events');
    }
    
    return this.currentRoute.startsWith(routerLink);
  }

  // Method for specific route checks
  isRouteActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  getHeaderClass(): string {
    if (!this.config?.company?.name) return 'default-header';
    return this.config.company.name.toLowerCase().replace(/\s+/g, '-');
  }

  toggleContactDropdown(): void {
    this.contactDropdownOpen = !this.contactDropdownOpen;
  }

  closeContactDropdown(): void {
    this.contactDropdownOpen = false;
  }

  getShortPhone(): string {
    const phone = this.getContactInfo().phone;
    return phone.replace(/\s/g, '').length > 12 ? 'Call Us' : phone;
  }

  getShortEmail(): string {
    const email = this.getContactInfo().email;
    return email.length > 20 ? 'Email Us' : email;
  }

  getLogoText(): string {
    return this.config?.company?.logo?.text || 'V4';
  }

  getLogoSublabel(): string {
    return this.config?.company?.logo?.sublabel || 'ENTERTAINMENT';
  }

  getContactInfo() {
    return this.config?.company?.contact || {
      phone: '+44 123 456 7890',
      email: 'info@v4entertainments.co.uk',
      address: 'London, UK'
    };
  }

  private applyTheme(config: HeaderConfig): void {
    document.documentElement.style.setProperty('--primary-color', config.company.primaryColor);
    document.documentElement.style.setProperty('--primary-dark', this.darkenColor(config.company.primaryColor, 20));
    document.documentElement.style.setProperty('--secondary-color', config.company.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', config.company.accentColor);
    document.documentElement.style.setProperty('--text-color', config.theme.textColor);
    document.documentElement.style.setProperty('--glass-bg', config.theme.glassBackground || 'rgba(255, 255, 255, 0.1)');
    document.documentElement.style.setProperty('--glass-border', config.theme.glassBorder || 'rgba(255, 255, 255, 0.15)');
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  copyToClipboard(text: string, type: 'phone' | 'email'): void {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'phone') {
        this.phoneCopied = true;
        setTimeout(() => this.phoneCopied = false, 2000);
      } else {
        this.emailCopied = true;
        setTimeout(() => this.emailCopied = false, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  navigateToTicketLookup(): void {
    this.router.navigate(['/tickets/lookup']);
  }

  getRouterLinkActiveOptions(item: any): any {
    // For home page, we want exact match
    if (item.routerLink === '/') {
      return { exact: true };
    }
    
    // For events, we want partial match to include all event routes
    if (item.routerLink === '/events') {
      return { exact: false };
    }
    
    // For other items, use default behavior
    return { exact: false };
  }
}