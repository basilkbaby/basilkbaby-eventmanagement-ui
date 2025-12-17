export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  type: EventType;
  venue: Venue;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  status: EventStatus;
  organizerId: string;
  organizerName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: EventSettings;
  checkoutQuestions: CheckoutQuestion[];
  ticketTiers: TicketTier[];
  bannerImage?: string;
  thumbnailImage?: string;
  gallery?: string[];
  termsAndConditions?: string;
  refundPolicy?: string;
  ageRestriction?: string;
  dressCode?: string;
  tags?: string[];
  sponsors?: Sponsor[];
  website?: string;
  socialMedia?: SocialMediaLinks;
  featured: boolean;
  priority?: number;
  seoDescription?: string;
  keywords?: string[];
}

export interface Venue {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  capacity?: number;
  image: string;
}

export interface EventSettings {
  id?: string;
  maxTicketsPerOrder: number;
  allowCancellations: boolean;
  cancellationDeadline: number;
  requireApproval: boolean;
  showRemainingTickets: boolean;
  timezone: string;
}

export interface CheckoutQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  order: number;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  available: number;
  benefits?: string[];
  isActive: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  sponsorLevel: SponsorLevel;
  description?: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export enum EventType {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  NETWORKING = 'networking',
  SOCIAL = 'social',
  SPORTS = 'sports',
  MUSIC = 'music',
  ART = 'art',
  COMEDY = 'comedy',
  THEATRE = 'theatre',
  FESTIVAL = 'festival',
  EXHIBITION = 'exhibition',
  OTHER = 'other'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum QuestionType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SINGLE_SELECT = 'single_select',
  MULTI_SELECT = 'multi_select',
  YES_NO = 'yes_no'
}

export enum SponsorLevel {
  PLATINUM = 'platinum',
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze',
  PARTNER = 'partner'
}

export interface VenueLayout {
  id: string;
  name: string;
  sections: VenueSection[];
}

export interface VenueSection {
  id: string;
  name: string;
  type: 'vip' | 'premium' | 'standard' | 'value' | 'obstructed';
  description: string;
  startingPrice: number;
  color: string;
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
  benefits: string[];
  availableSeats: number;
  totalSeats: number;
  position: 'front' | 'middle' | 'back' | 'side';
  viewQuality: 'excellent' | 'great' | 'good' | 'limited';
}


export interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  type: 'standard' | 'vip' | 'accessible'| 'standing' | 'seated';
  price: number;
  status: 'available' | 'selected' | 'taken' | 'reserved';
  x: number;
  y: number;
  eventId?: string;
  eventTitle?: string;
  eventDate?: Date;
  eventTime?: string;
  venueName?: string;
  ticketTierId?: string;
  ticketTierName?: string;
  quantity?: number;
  total?: number;
  venue?: string;
}


export interface CartItem {
  id?: string;
  seat?: Seat;
  ticketType?: TicketType;
  quantity: number;
  price: number;
  type?: 'seat' | 'ticketType';
  addedAt?: Date;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  description: string;
  eventId?: string;
  eventTitle?: string;
  eventDate?: Date;
  venue?: string;
}