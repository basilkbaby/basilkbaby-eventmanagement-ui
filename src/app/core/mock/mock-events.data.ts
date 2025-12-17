import { Event, EventType, QuestionType, SponsorLevel, EventStatus } from '../models/event.model';
 const today = new Date();
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
const twoMonthsLater = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

export const MOCK_EVENTS: Event[] = [
  {
    id: '4',
    title: 'SITHARA\'S PROJECT MALABARICUS - WIGAN',
    description: 'An extraordinary musical journey through the rich cultural heritage of Malabar. Sithara presents Project Malabaricus - a spectacular fusion of traditional Malabari folk music with contemporary arrangements, featuring a 30-piece orchestra and special guest artists. Experience the soul of Kerala like never before in this groundbreaking musical production.',
    shortDescription: 'A spectacular fusion of Malabari folk music with contemporary orchestral arrangements.',
    type: EventType.MUSIC,
    venue: {
      name: 'THE EDGE  ARENA',
      address: 'Riveredge',
      city: 'WIGAN',
      state: 'Greater London',
      zipCode: 'WN3 5AB',
      country: 'UK',
      capacity: 5272,
      image: 'assets/images/venues/the-royal-albert-hall.jpg'
    },
    startDate: new Date('2026-02-20'),
    endDate: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
    startTime: '18:00',
    endTime: '22:00',
    status: EventStatus.PUBLISHED,
    organizerId: 'v4',
    organizerName: 'V4 Entertainments',
    isActive: true,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-15'),
    settings: {
      maxTicketsPerOrder: 6,
      allowCancellations: true,
      cancellationDeadline: 96,
      requireApproval: false,
      showRemainingTickets: true,
      timezone: 'Europe/London'
    },
    checkoutQuestions: [
      {
        id: '1',
        question: 'Would you like to join the post-show reception?',
        type: QuestionType.YES_NO,
        required: false,
        order: 1
      }
    ],
    ticketTiers: [
      {
        id: '1',
        name: 'VIP Royal Experience',
        price: 150,
        description: 'Premium front stalls seating, post-show reception with Sithara, signed program, and VIP gift pack',
        quantity: 100,
        available: 85,
        benefits: ['Premium seating', 'Meet & Greet with Sithara', 'Signed program', 'VIP gift pack', 'Post-show reception'],
        isActive: true
      },
      {
        id: '2',
        name: 'Gold Circle',
        price: 89,
        description: 'Excellent stalls seating with great stage view',
        quantity: 500,
        available: 420,
        benefits: ['Great stage view', 'Early entry'],
        isActive: true
      },
      {
        id: '3',
        name: 'Standard',
        price: 49,
        description: 'Standard seating in circle sections',
        quantity: 2000,
        available: 1850,
        benefits: [],
        isActive: true
      },
      {
        id: '4',
        name: 'Balcony',
        price: 35,
        description: 'Economy seating in balcony sections',
        quantity: 2672,
        available: 2500,
        benefits: [],
        isActive: true
      }
    ],
    bannerImage: 'assets/images/events/sithara.webp',
    thumbnailImage: 'assets/images/events/sithara.webp',
    gallery: [
      'assets/images/events/sithara.webp'
    ],
    termsAndConditions: `
      1. All tickets are non-refundable except in case of event cancellation.
      2. VIP ticket holders must arrive by 18:00 for the pre-show reception.
      3. Photography without flash is permitted during the performance.
      4. Latecomers will be admitted at a suitable break in the performance.
      5. The program may be subject to change without notice.
    `,
    refundPolicy: 'Refunds only available if event is cancelled. No refunds for change of mind or personal circumstances.',
    ageRestriction: 'Recommended for ages 8+. Under 16s must be accompanied by an adult.',
    dressCode: 'Smart attire recommended. No sportswear.',
    tags: ['malayalam-music', 'folk-fusion', 'orchestral', 'kerala-culture', 'sithara', 'royal-albert-hall'],
    sponsors: [
      {
        id: '6',
        name: 'Kerala Tourism',
        logo: 'assets/images/sponsors/kerala-tourism-logo.png',
        website: 'https://keralatourism.org',
        sponsorLevel: SponsorLevel.PLATINUM,
        description: 'Presented in association with Kerala Tourism'
      },
      {
        id: '7',
        name: 'Air India',
        logo: 'assets/images/sponsors/air-india-logo.png',
        website: 'https://airindia.com',
        sponsorLevel: SponsorLevel.GOLD,
        description: 'Official Airline Partner'
      },
      {
        id: '8',
        name: 'Malabar Gold',
        logo: 'assets/images/sponsors/Malabar_Gold.webp',
        website: 'https://malabargold.com',
        sponsorLevel: SponsorLevel.SILVER,
        description: 'Jewellery Partner'
      }
    ],
    website: 'https://v4entertainments.co.uk/sithara-malabaricus',
    socialMedia: {
      facebook: 'https://facebook.com/v4entertainments',
      instagram: 'https://instagram.com/sitharamalabaricus',
      twitter: 'https://twitter.com/sitharamalabaric',
      youtube: 'https://youtube.com/sithara'
    },
    featured: true,
    priority: 1,
    seoDescription: 'Sithara\'s Project Malabaricus at Royal Albert Hall - Experience the fusion of Malabari folk music with contemporary orchestral arrangements.',
    keywords: ['Sithara', 'Malabaricus', 'Malayalam music', 'folk fusion', 'Royal Albert Hall', 'Kerala culture']
  },  
  {
    id: '9',
    title: 'SITHARA\'S PROJECT MALABARICUS - Manchester',
    description: 'An extraordinary musical journey through the rich cultural heritage of Malabar. Sithara presents Project Malabaricus - a spectacular fusion of traditional Malabari folk music with contemporary arrangements, featuring a 30-piece orchestra and special guest artists. Experience the soul of Kerala like never before in this groundbreaking musical production.',
    shortDescription: 'A spectacular fusion of Malabari folk music with contemporary orchestral arrangements.',
    type: EventType.MUSIC,
    venue: {
      name: 'Royal Albert Hall',
      address: 'Kensington Gore',
      city: 'London',
      state: 'Greater London',
      zipCode: 'SW7 2AP',
      country: 'UK',
      capacity: 5272,
      image: 'assets/images/venues/the-royal-albert-hall.jpg'
    },
    startDate: new Date(nextMonth.setDate(nextMonth.getDate() + 10)) ,
    endDate: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
    startTime: '19:30',
    endTime: '22:00',
    status: EventStatus.PUBLISHED,
    organizerId: 'v4',
    organizerName: 'V4 Entertainments',
    isActive: true,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-15'),
    settings: {
      maxTicketsPerOrder: 6,
      allowCancellations: true,
      cancellationDeadline: 96,
      requireApproval: false,
      showRemainingTickets: true,
      timezone: 'Europe/London'
    },
    checkoutQuestions: [
      {
        id: '1',
        question: 'Would you like to join the post-show reception?',
        type: QuestionType.YES_NO,
        required: false,
        order: 1
      }
    ],
    ticketTiers: [
      {
        id: '1',
        name: 'VIP Royal Experience',
        price: 150,
        description: 'Premium front stalls seating, post-show reception with Sithara, signed program, and VIP gift pack',
        quantity: 100,
        available: 85,
        benefits: ['Premium seating', 'Meet & Greet with Sithara', 'Signed program', 'VIP gift pack', 'Post-show reception'],
        isActive: true
      },
      {
        id: '2',
        name: 'Gold Circle',
        price: 89,
        description: 'Excellent stalls seating with great stage view',
        quantity: 500,
        available: 420,
        benefits: ['Great stage view', 'Early entry'],
        isActive: true
      },
      {
        id: '3',
        name: 'Standard',
        price: 49,
        description: 'Standard seating in circle sections',
        quantity: 2000,
        available: 1850,
        benefits: [],
        isActive: true
      },
      {
        id: '4',
        name: 'Balcony',
        price: 35,
        description: 'Economy seating in balcony sections',
        quantity: 2672,
        available: 2500,
        benefits: [],
        isActive: true
      }
    ],
    bannerImage: 'assets/images/events/sithara.webp',
    thumbnailImage: 'assets/images/events/sithara.webp',
    gallery: [
      'assets/images/events/sithara.webp'
    ],
    termsAndConditions: `
      1. All tickets are non-refundable except in case of event cancellation.
      2. VIP ticket holders must arrive by 18:00 for the pre-show reception.
      3. Photography without flash is permitted during the performance.
      4. Latecomers will be admitted at a suitable break in the performance.
      5. The program may be subject to change without notice.
    `,
    refundPolicy: 'Refunds only available if event is cancelled. No refunds for change of mind or personal circumstances.',
    ageRestriction: 'Recommended for ages 8+. Under 16s must be accompanied by an adult.',
    dressCode: 'Smart attire recommended. No sportswear.',
    tags: ['malayalam-music', 'folk-fusion', 'orchestral', 'kerala-culture', 'sithara', 'royal-albert-hall'],
    sponsors: [
      {
        id: '6',
        name: 'Kerala Tourism',
        logo: 'assets/images/sponsors/kerala-tourism-logo.png',
        website: 'https://keralatourism.org',
        sponsorLevel: SponsorLevel.PLATINUM,
        description: 'Presented in association with Kerala Tourism'
      },
      {
        id: '7',
        name: 'Air India',
        logo: 'assets/images/sponsors/air-india-logo.png',
        website: 'https://airindia.com',
        sponsorLevel: SponsorLevel.GOLD,
        description: 'Official Airline Partner'
      },
      {
        id: '8',
        name: 'Malabar Gold',
        logo: 'assets/images/sponsors/Malabar_Gold.webp',
        website: 'https://malabargold.com',
        sponsorLevel: SponsorLevel.SILVER,
        description: 'Jewellery Partner'
      }
    ],
    website: 'https://v4entertainments.co.uk/sithara-malabaricus',
    socialMedia: {
      facebook: 'https://facebook.com/v4entertainments',
      instagram: 'https://instagram.com/sitharamalabaricus',
      twitter: 'https://twitter.com/sitharamalabaric',
      youtube: 'https://youtube.com/sithara'
    },
    featured: true,
    priority: 1,
    seoDescription: 'Sithara\'s Project Malabaricus at Royal Albert Hall - Experience the fusion of Malabari folk music with contemporary orchestral arrangements.',
    keywords: ['Sithara', 'Malabaricus', 'Malayalam music', 'folk fusion', 'Royal Albert Hall', 'Kerala culture']
  }
];