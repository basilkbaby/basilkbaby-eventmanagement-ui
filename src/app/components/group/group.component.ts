import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventDto } from '../../core/models/DTOs/event.DTO.model';
import { EventListComponent } from '../event-list/event-list.component';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, RouterModule, EventListComponent],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  events: EventDto[] = [];
  groupName = '';
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private eventService: EventService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.loadGroup(groupId);
    });
  }

  loadGroup(groupId: string): void {
    this.loading = true;
    this.error = null;
    this.eventService.getEventsByGroup(groupId).subscribe({
      next: (events) => {
        this.events = events || [];
        this.groupName = this.events[0]?.groupName || 'Events';
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load this group. Please try again.';
        this.loading = false;
      }
    });
  }
}
