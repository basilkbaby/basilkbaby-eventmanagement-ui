import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CartService } from './core/services/cart.service';
import { HeaderComponent } from './components/common/header/header.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { filter, Subscription } from 'rxjs';
import { ConfigService } from './core/services/config.service';
import { FooterComponent } from './components/common/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  cartItemCount = 0;
  private cartStateSubscription: Subscription | undefined;

  constructor(
    private cartService: CartService,
    private router: Router,
    private configService: ConfigService
  ) {
 // Subscribe to cart state
 // Subscribe to cart state changes
    this.cartStateSubscription = this.cartService.currentCartState$.subscribe({
      next: (state) => {
        // Calculate count from cart items
        this.cartItemCount = state.items.reduce((count, item) => count + item.quantity, 0);
      }
    });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });

      this.configService.loadConfig().then(() => {
      console.log('Configuration loaded successfully');
    }).catch(error => {
      console.error('Failed to load configuration:', error);
    });
  }

  title = 'TicketFlow - Modern Ticket System';
  
  // Track the current theme
  currentTheme: 'light' | 'dark' = 'light';
    currentRoute: string = '';

  // Method to toggle between themes
  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  }
  
  // Apply the theme to the document
  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Optional: Store user preference in localStorage
    localStorage.setItem('app-theme', this.currentTheme);
  }

  isHomePage(): boolean {
    return this.currentRoute === '/' || this.currentRoute === '/events';
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }
    this.applyTheme();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }


}