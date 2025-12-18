// social-media-feed.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ShortNumberPipe } from '../../../core/pipes/short-number-pipe';

interface SocialEngagement {
  likes: number;
  followers: number;
}

interface SocialPlatform {
  handle?: string;
  engagement?: SocialEngagement;
  url: string;
  isLive?: boolean;
}

interface SocialData {
  facebook?: SocialPlatform;
  instagram?: SocialPlatform;
}

@Component({
  selector: 'app-social-media-feed',
  standalone: true,
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './social-media-feed.component.html',
  styleUrls: ['./social-media-feed.component.scss']
})
export class SocialMediaFeedComponent implements OnInit {
  @Input() socialData!: SocialData;
  @Input() isLoading: boolean = false;

  get totalFollowers(): number {
    const fb = this.socialData?.facebook?.engagement?.followers || 0;
    const ig = this.socialData?.instagram?.engagement?.followers || 0;
    return fb + ig;
  }

  defaultSocialData: SocialData = {
    facebook: {
      handle: 'ourevent',
      url: 'https://facebook.com/yourevent',
      engagement: {
        likes: 12500,
        followers: 24500
      },
      isLive: false
    },
    instagram: {
      handle: 'ourevent',
      url: 'https://instagram.com/yourevent',
      engagement: {
        likes: 18700,
        followers: 34200
      },
      isLive: true
    }
  };

  ngOnInit() {
    if (!this.socialData) {
      this.socialData = { ...this.defaultSocialData };
    }
  }

  openSocialLink(platform: 'facebook' | 'instagram') {
    const url = this.socialData?.[platform]?.url;
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Safe getter methods for template
  getFacebookEngagement() {
    return this.socialData?.facebook?.engagement || { likes: 0, followers: 0 };
  }

  getInstagramEngagement() {
    return this.socialData?.instagram?.engagement || { likes: 0, followers: 0 };
  }
}