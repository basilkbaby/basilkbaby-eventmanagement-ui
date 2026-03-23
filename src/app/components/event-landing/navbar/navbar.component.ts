import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() links: Array<{ label: string; section: string }> = [];
  @Input() logo: { text: string; year: string } = { text: '', year: '' };
  @Input() isScrolled: boolean = false;
  @Output() scrollTo   = new EventEmitter<string>();
  @Output() buyTickets = new EventEmitter<string>();

  mobileOpen = false;
}