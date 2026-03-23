import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() logo: { text: string; year: string } = { text: '', year: '' };
  @Input() year: string = new Date().getFullYear().toString();

  navLinks = ['Home', 'Artists', 'Venues', 'Tickets', 'Contact'];
}