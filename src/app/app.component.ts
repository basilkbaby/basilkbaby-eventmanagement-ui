import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CartService } from './core/services/cart.service';
import { HeaderComponent } from './components/common/header/header.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { NotificationComponent } from './components/common/notification/notification.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  title        = 'TicketFlow - Modern Ticket System';
  cartItemCount = 0;
  currentRoute  = '';
  currentTheme: 'light' | 'dark' = 'light';

  private cartSub: Subscription | undefined;
  private routerSub: Subscription | undefined;

  constructor(
    private cartService: CartService,
    private router: Router
    // ConfigService removed — APP_INITIALIZER already calls loadConfig()
    // Calling it again here was resetting the signal mid-render
  ) {}

  ngOnInit(): void {
    // Restore theme preference
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
    if (savedTheme) this.currentTheme = savedTheme;
    this.applyTheme();

    // Track cart count
    this.cartSub = this.cartService.currentCartState$.subscribe(state => {
      this.cartItemCount = state.items.reduce((n, i) => n + i.quantity, 0);
    });

    // Track current route
    this.currentRoute = this.router.url;
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.url;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('app-theme', this.currentTheme);
  }

  isHomePage():             boolean { return this.currentRoute === '/' || this.currentRoute === '/events'; }
  isActiveRoute(r: string): boolean { return this.router.url === r; }
  goHome():  void { this.router.navigate(['/']); }
  goToCart(): void { this.router.navigate(['/cart']); }
}