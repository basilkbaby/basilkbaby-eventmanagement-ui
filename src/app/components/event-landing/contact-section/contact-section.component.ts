import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-section.component.html',
  styleUrls: ['./contact-section.component.scss']
})
export class ContactSectionComponent {
  @Input() contacts: Array<{ number: string; name: string; icon: string }> = [];
  @Output() buyTickets = new EventEmitter<string>();
  @Output() scrollTo  = new EventEmitter<string>();

}