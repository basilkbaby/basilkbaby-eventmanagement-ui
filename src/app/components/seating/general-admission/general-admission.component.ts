import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { SelectedSeat, TicketType, VenueSection } from '../../../core/models/seats.model';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';

interface GAOption {
  id: string;
  name: string;
  price: number;
  maxPerOrder: number;
  color: string;
  type: TicketType;
}

@Component({
  selector: 'app-general-admission',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './general-admission.component.html',
  styleUrls: ['./general-admission.component.scss']
})
export class GeneralAdmissionComponent implements OnInit, OnChanges {
  @Input() venueSection: VenueSection | null = null;
  @Output() backToSeatMap = new EventEmitter<void>();
  @Output() seatsSelected = new EventEmitter<SelectedSeat[]>();

  gaOptions:  GAOption[] = [];
  selections: { [optionId: string]: number } = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit() { this.initializeOptions(); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['venueSection'] && !changes['venueSection'].firstChange) {
      this.initializeOptions();
    }
  }

  private initializeOptions() {
    if (this.venueSection?.rowConfigs?.length) {
      const sectionName = this.venueSection.sectionLabel || this.venueSection.name;
      this.gaOptions = this.venueSection.rowConfigs.map(cfg => ({
        id: cfg.id,
        name: sectionName,
        price: cfg.customPrice || 0,
        maxPerOrder: 8,
        color: cfg.color || '#4CAF50',
        type: cfg.type as TicketType
      }));
    } else {
      this.gaOptions = [{
        id: 'ga-regular',
        name: 'Standing Ticket',
        price: 45,
        maxPerOrder: 8,
        color: '#4CAF50',
        type: 'GENERAL'
      }];
    }
    this.selections = {};
    this.gaOptions.forEach(o => { this.selections[o.id] = 0; });
  }

  increment(optionId: string) {
    const option = this.gaOptions.find(o => o.id === optionId);
    if (!option) return;
    const current = this.selections[optionId] || 0;
    if (current < option.maxPerOrder) {
      this.selections[optionId] = current + 1;
    } else {
      this.notificationService.showWarning(`Maximum ${option.maxPerOrder} tickets allowed`);
    }
  }

  decrement(optionId: string) {
    const current = this.selections[optionId] || 0;
    if (current > 0) this.selections[optionId] = current - 1;
  }

  canIncrement(optionId: string): boolean {
    const option = this.gaOptions.find(o => o.id === optionId);
    return !!option && (this.selections[optionId] || 0) < option.maxPerOrder;
  }

  get totalQuantity(): number {
    return Object.values(this.selections).reduce((sum, qty) => sum + qty, 0);
  }

  get totalPrice(): number {
    return this.gaOptions.reduce((sum, o) => sum + o.price * (this.selections[o.id] || 0), 0);
  }

  clearAll() { this.gaOptions.forEach(o => { this.selections[o.id] = 0; }); }

  addToSelection() {
    if (this.totalQuantity === 0) {
      this.notificationService.showWarning('Please select at least one ticket');
      return;
    }

    const seats: SelectedSeat[] = [];
    const ts = Date.now().toString(36).toUpperCase();

    this.gaOptions.forEach(option => {
      const qty = this.selections[option.id] || 0;
      for (let i = 0; i < qty; i++) {
        seats.push({
          seatId: `GA-${ts}-${i}`,
          row: 'GA',
          number: i + 1,
          sectionName: option.name,
          sectionId: this.venueSection?.id || 'general-admission',
          sectionConfigId: option.id,
          tier: { id: option.id, name: option.type, price: option.price, color: option.color },
          price: option.price,
          features: [],
          isStandingArea: true,
          isGeneralAdmission: true
        });
      }
    });

    this.seatsSelected.emit(seats);
  }

  goBack() { this.backToSeatMap.emit(); }
}
