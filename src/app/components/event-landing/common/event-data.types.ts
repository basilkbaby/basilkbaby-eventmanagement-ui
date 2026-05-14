export interface Venue {
  id: string;
  name: string;
  location: string;
  address: string;
  date: string;
  time: string;
  gateopentime: string;
  mapUrl: string;
  imageUrl: string;
  capacity: string;
  features: string[];
  ticketsOpen?: boolean;
  eventId: string;
}

export interface Artist {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  isLead?: boolean;
  social: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface Sponsor {
  name: string;
  logo: string;
  tier: 'platinum' | 'gold' | 'silver' | 'partner';
}

export interface Contact {
  number: string;
  name: string;
  icon: string;
}

export interface Production {
  icon: string;
  title: string;
  description: string;
}

export interface EventConfig {
  logo: {
    text: string;
    year: string;
  };
  eyebrow: string;
  heroTags: string[];
  navLinks: Array<{ label: string; section: string }>;
  bannerImages: string[];
  presenters: string[];
  stats: Array<{ number: string; label: string }>;
  mainTitle: {
    line1: string;
    line2: string;
    year: string;
  };
  tagline: string;
  productions: Production[];
  year: string;
}

export interface EventDataSet {
  venues: Venue[];
  artists: Artist[];
  sponsors: Sponsor[];
  contacts: Contact[];
  config: EventConfig;
}
