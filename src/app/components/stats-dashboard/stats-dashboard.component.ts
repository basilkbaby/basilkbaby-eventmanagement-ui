// stats-dashboard.component.ts
import { Component, OnInit } from '@angular/core';

export interface EventStats {
  totalTicketsSold: number;
  totalEvents: number;
  soldOutEvents: number;
  trends: {
    tickets: { value: number; isPositive: boolean };
    events: { value: number; isPositive: boolean };
    soldOut: { value: number; isPositive: boolean };
  };
}

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  templateUrl: './stats-dashboard.component.html',
  styleUrls: ['./stats-dashboard.component.scss']
})
export class StatsDashboardComponent implements OnInit {
  stats: EventStats = {
    totalTicketsSold: 12475,
    totalEvents: 48,
    soldOutEvents: 12,
    trends: {
      tickets: { value: 24, isPositive: true },
      events: { value: 8, isPositive: true },
      soldOut: { value: 92, isPositive: true }
    }
  };

  ngOnInit() {
    // Load real data from API if needed
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }
}