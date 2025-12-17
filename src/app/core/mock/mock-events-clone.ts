import { Event, EventType, QuestionType, SponsorLevel, EventStatus } from '../models/event.model';
 const today = new Date();
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
const twoMonthsLater = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

export const MOCK_EVENTSClone: Event[] = [
    {
    id: '4',
    title: 'SITHARA\'S PROJECT MALABARICUS',
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
    startDate: nextMonth,
    endDate: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
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
  },
  {
    id: '1',
    title: 'Mohanlal Live London: Beyond the Screen',
    description: 'The first-ever Mollywood show at Wembley Arena featuring legendary Indian actor Mohanlal alongside other top celebrities and playback singers. An unforgettable evening of music, dance, and entertainment that brings together the best of Indian cinema and live performance.',
    shortDescription: 'Legendary actor Mohanlal in his first-ever Wembley Arena show with special celebrity guests.',
    type: EventType.MUSIC,
    venue: {
      name: 'OVO Arena Wembley',
      address: 'Empire Way',
      city: 'London',
      state: 'Greater London',
      zipCode: 'HA9 0DH',
      country: 'UK',
      capacity: 12500,
      image: 'assets/images/venues/the-royal-albert-hall.jpg'
    },
    startDate: nextMonth,
    endDate: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
    startTime: '19:00',
    endTime: '22:00',
    status: EventStatus.PUBLISHED,
    organizerId: 'ukeventlife',
    organizerName: 'UK Event Life',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-25'),
    settings: {
      maxTicketsPerOrder: 8,
      allowCancellations: true,
      cancellationDeadline: 168,
      requireApproval: false,
      showRemainingTickets: true,
      timezone: 'Europe/London'
    },
    checkoutQuestions: [
      {
        id: '1',
        question: 'Dietary requirements for Meet & Greet dinner',
        type: QuestionType.TEXT,
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
    bannerImage: 'assets/images/events/mohanlal-banner.jpg',
    thumbnailImage: 'assets/images/events/mohanlal-banner.jpg',
    gallery: [
      'assets/images/events/mohanlal-banner.jpg',
      'assets/images/events/mohanlal-banner.jpg',
      'assets/images/events/mohanlal-banner.jpg'
    ],
    termsAndConditions: `
      1. All tickets are non-transferable and non-refundable except in case of event cancellation.
      2. VVIP Meet & Greet participants must arrive by 5:00 PM sharp.
      3. Professional photography and recording devices are not permitted.
      4. The organizer reserves the right to refuse admission.
      5. Age restriction: This event is suitable for all ages. Under 16s must be accompanied by an adult.
      6. In case of event postponement, tickets will be valid for the rescheduled date.
    `,
    refundPolicy: `
      Refunds are only available if the event is cancelled by the organizer. 
      No refunds will be provided for no-shows or personal schedule conflicts.
      Refund requests must be submitted within 30 days of event cancellation.
    `,
    ageRestriction: 'All ages welcome. Under 16s must be accompanied by an adult.',
    dressCode: 'Smart casual. No sportswear or beachwear.',
    tags: ['mollywood', 'indian-cinema', 'live-music', 'celebrity-event', 'wembley'],
    sponsors: [
      {
        id: '1',
        name: 'Asian TV',
        logo: 'assets/images/sponsors/asian-tv-logo.png',
        website: 'https://asiantv.com',
        sponsorLevel: SponsorLevel.PLATINUM,
        description: 'Official Media Partner'
      },
      {
        id: '2',
        name: 'MoneyGram',
        logo: 'assets/images/sponsors/moneygram-logo.png',
        website: 'https://moneygram.com',
        sponsorLevel: SponsorLevel.GOLD,
        description: 'Financial Services Partner'
      },
      {
        id: '3',
        name: 'Spice Route',
        logo: 'assets/images/sponsors/spice-route-logo.png',
        sponsorLevel: SponsorLevel.SILVER,
        description: 'Hospitality Partner'
      }
    ],
    website: 'https://mohanlallive-london.com',
    socialMedia: {
      facebook: 'https://facebook.com/mohanlallivelondon',
      instagram: 'https://instagram.com/mohanlallivelondon',
      twitter: 'https://twitter.com/mohanlallive'
    },
    featured: true,
    priority: 1,
    seoDescription: 'Mohanlal Live London at Wembley Arena - First-ever Mollywood show with legendary actor Mohanlal and special celebrity guests.',
    keywords: ['Mohanlal', 'Wembley', 'Mollywood', 'Indian cinema', 'London events']
  },
  {
    id: '2',
    title: 'AGAM - Live in Concert',
    description: 'An unforgettable evening with AGAM featuring their latest hits and classic favorites. Experience the magic of AGAM live in concert with spectacular visuals and sound that will transport you through their musical journey.',
    shortDescription: 'Experience AGAM\'s unique fusion sound in an intimate concert setting.',
    type: EventType.MUSIC,
    venue: {
      name: 'O2 Guildhall Southampton',
      address: 'Westquay Rd',
      city: 'Southampton',
      state: 'Hampshire',
      zipCode: 'SO15 1WG',
      country: 'UK',
      capacity: 800,
      image: 'assets/images/venues/the-royal-albert-hall.jpg'
    },
    startDate: new Date('2024-02-15'), // Past date
    endDate: new Date('2024-02-15'),
    startTime: '19:30',
    endTime: '22:30',
    status: EventStatus.COMPLETED, // Changed to COMPLETED
    organizerId: 'v4',
    organizerName: 'V4 Entertainments',
    isActive: false, // Set to inactive
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-20'),
    settings: {
      maxTicketsPerOrder: 6,
      allowCancellations: true,
      cancellationDeadline: 72,
      requireApproval: false,
      showRemainingTickets: true,
      timezone: 'Europe/London'
    },
    checkoutQuestions: [],
    ticketTiers: [
      // ... existing ticket tiers with all tickets sold
      {
        id: '1',
        name: 'General Admission',
        price: 35,
        description: 'Standing area access',
        quantity: 600,
        available: 0, // All sold out
        benefits: [],
        isActive: true
      }
    ],
    bannerImage: 'assets/images/events/agam-banner.jpg',
    thumbnailImage: 'assets/images/events/agam-banner.jpg',
    gallery: [
      'assets/images/events/agam-banner.jpg',
      'assets/images/events/agam-banner.jpg'
    ],
    termsAndConditions: `
      1. Tickets are non-refundable and non-exchangeable.
      2. Doors open 1 hour before show time.
      3. The venue operates a challenge 25 policy.
      4. Bag checks will be in operation.
      5. The lineup is subject to change.
    `,
    refundPolicy: 'No refunds except in case of event cancellation. In case of cancellation, refunds will be processed within 14 working days.',
    ageRestriction: '16+. Under 18s must be accompanied by an adult.',
    dressCode: 'Casual',
    tags: ['fusion-music', 'indian-band', 'live-concert', 'southampton'],
    sponsors: [
      {
        id: '4',
        name: 'V4 Entertainments',
        logo: 'assets/images/sponsors/v4-logo.png',
        website: 'https://v4entertainments.co.uk',
        sponsorLevel: SponsorLevel.PLATINUM,
        description: 'Presented by'
      },
      {
        id: '5',
        name: 'UK Event Life',
        logo: 'assets/images/sponsors/ukeventlife-logo.png',
        website: 'https://ukeventlife.co.uk',
        sponsorLevel: SponsorLevel.GOLD,
        description: 'Event Partner'
      }
    ],
    website: 'https://v4entertainments.co.uk/agam-tour',
    socialMedia: {
      facebook: 'https://facebook.com/v4entertainments',
      instagram: 'https://instagram.com/v4entertainments',
      twitter: 'https://twitter.com/v4entertainment'
    },
    featured: false, // No longer featured
    priority: 5, // Lower priority
    seoDescription: 'AGAM Live in Concert - Experience their unique fusion sound at O2 Guildhall Southampton.',
    keywords: ['AGAM', 'fusion music', 'Southampton concert', 'Indian band UK']
  },
  {
    id: '3',
    title: 'AGAM - UK Tour: Birmingham',
    description: 'AGAM continues their UK tour with a special performance in Birmingham. Don\'t miss this opportunity to see one of the most exciting bands live in an intimate venue with incredible acoustics.',
    shortDescription: 'AGAM brings their UK tour to Birmingham with special guest performances.',
    type: EventType.MUSIC,
    venue: {
      name: 'O2 Institute Birmingham',
      address: '78 Digbeth High Street',
      city: 'Birmingham',
      state: 'West Midlands',
      zipCode: 'B5 6DY',
      country: 'UK',
      capacity: 600,
      image: 'assets/images/venues/the-royal-albert-hall.jpg'
    },
    startDate: new Date('2024-02-18'), // Past date
    endDate: new Date('2024-02-18'),
    startTime: '20:00',
    endTime: '23:00',
    status: EventStatus.COMPLETED, // Changed to COMPLETED
    organizerId: 'v4',
    organizerName: 'V4 Entertainments',
    isActive: false, // Set to inactive
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-11-20'),
    settings: {
      maxTicketsPerOrder: 4,
      allowCancellations: true,
      cancellationDeadline: 48,
      requireApproval: false,
      showRemainingTickets: true,
      timezone: 'Europe/London'
    },
    checkoutQuestions: [],
    ticketTiers: [
      // ... existing ticket tiers with all tickets sold
      {
        id: '1',
        name: 'General Admission',
        price: 35,
        description: 'Standing area access',
        quantity: 500,
        available: 0, // All sold out
        benefits: [],
        isActive: true
      }
    ],
    bannerImage: 'assets/images/events/agam-banner.jpg',
    thumbnailImage: 'assets/images/events/agam-banner.jpg',
    gallery: [
      'assets/images/events/agam-banner.jpg',
      'assets/images/events/agam-banner.jpg'
    ],
    termsAndConditions: `
      1. This is a standing event.
      2. No re-entry after admission.
      3. Professional cameras and recording equipment prohibited.
      4. The artist lineup may be subject to change.
      5. Management reserves the right to refuse admission.
    `,
    refundPolicy: 'Tickets are non-refundable. In the event of cancellation, ticket holders will be notified and refunds processed.',
    ageRestriction: '14+. Under 16s must be accompanied by an adult aged 18+. Under 14s not permitted.',
    dressCode: 'Casual. Comfortable shoes recommended for standing.',
    tags: ['fusion-music', 'birmingham', 'uk-tour', 'live-music'],
    sponsors: [
      {
        id: '4',
        name: 'V4 Entertainments',
        logo: 'assets/images/sponsors/v4-logo.png',
        website: 'https://v4entertainments.co.uk',
        sponsorLevel: SponsorLevel.PLATINUM,
        description: 'Presented by'
      }
    ],
    socialMedia: {
      instagram: 'https://instagram.com/v4entertainments',
      facebook: 'https://facebook.com/v4entertainments'
    },
    featured: false,
    priority: 6, // Lower priority
    seoDescription: 'AGAM UK Tour comes to Birmingham - Don\'t miss this intimate concert experience.',
    keywords: ['AGAM Birmingham', 'UK tour', 'O2 Institute', 'fusion music']
  }
];