// about-us.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = false;

  companyData = {
    tagline: "Bringing Kerala's Music to the UK",
    description: "We are London's premier Malayali concert specialists, creating unforgettable musical experiences that connect the UK Malayali community with Kerala's finest artists. From intimate ghazal nights to grand-scale superstar concerts, we bridge cultures through music.",
    
    venues: [
      { 
        name: "Royal Albert Hall", 
        city: "London",
        features: ["Historic Venue", "5,272 Capacity", "Premium Acoustics"],
        pastEvents: ["Dulquer Salmaan Live", "Mohanlal Night"]
      },
      { 
        name: "Birmingham Symphony Hall", 
        city: "Birmingham",
        features: ["Acoustic Excellence", "2,262 Seats", "VIP Lounges"],
        pastEvents: ["Ghazal Nights", "Carnatic Fusion"]
      },
      { 
        name: "Manchester Apollo", 
        city: "Manchester",
        features: ["Art Deco Design", "3,500 Capacity", "Intimate Atmosphere"],
        pastEvents: ["Indie Malayalam", "New Talent Showcases"]
      }
    ],

    featuredArtists: [
      { 
        name: "Vidhu Prathap", 
        category: "Playback Singer",
        upcomingShow: "May 2024 - London",
        status: "Booking Open"
      },
      { 
        name: "Agam Band", 
        category: "Carnatic Rock Band",
        upcomingShow: "June 2024 - Multiple Cities",
        status: "Early Bird"
      },
      { 
        name: "Malabaricus", 
        category: "Folk Fusion Ensemble",
        upcomingShow: "July 2024 - UK Tour",
        status: "Early Bird"
      }
    ],

    stats: [
      { number: "50K+", label: "Malayali Audience" },
      { number: "10+", label: "Concerts Produced" },
      { number: "5+", label: "Kerala Artists Brought to UK" },
      { number: "10", label: "UK Cities Covered" }
    ]
  };

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  getStatusClass(status: string): string {
    const statusMap: {[key: string]: string} = {
      'Sold Out': 'status-soldout',
      'Limited Seats': 'status-limited',
      'Booking Open': 'status-open',
      'Early Bird': 'status-early',
      'Announcing Soon': 'status-soon',
      'Member Pre-sale': 'status-presale'
    };
    return statusMap[status] || 'status-default';
  }
}