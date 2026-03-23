export interface Venue {
  id: string;
  name: string;
  location: string;
  address: string;
  date: string;
  time: string;
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

export const VENUE_DATA: Venue[] = [
  {
    id: 'blackpool',
    name: 'Winter Gardens Blackpool',
    location: 'Blackpool',
    address: '97 Church St., Blackpool FY1 1HL',
    date: '22nd AUGUST 2026',
    time: '6:00 PM',
    mapUrl: 'https://maps.google.com/?q=Winter+Gardens+Blackpool',
    imageUrl: 'https://www.creativetourist.com/app/uploads/2020/12/367e8f571aa80544cd66907f2acf31aa.jpg',
    capacity: '3,000 seats',
    features: ['Live Orchestra', 'Disabled Access', 'Parking Available'],
    ticketsOpen : false,
    eventId: '5b23904a-2ba5-4bbe-ae62-acacbe4677cb'
  },
  // {
  //   id: 'manchester',
  //   name: 'AO Arena Manchester',
  //   location: 'Manchester, UK',
  //   address: 'Victoria Station, Hunts Bank, Manchester M3 1AR',
  //   date: '29th AUGUST 2026',
  //   time: '7:00 PM',
  //   mapUrl: 'https://maps.google.com/?q=AO+Arena+Manchester',
  //   imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  //   capacity: '21,000 seats',
  //   features: ['Premium Seating', 'Restaurants', 'VIP Parking', 'Hotel Nearby'],
  //   ticketsOpen : false,
  //   eventId: '5b23904a-2ba5-4bbe-ae62-acacbe4677cb'
  // },
  // {
  //   id: 'london',
  //   name: 'The O2 Arena',
  //   location: 'London, UK',
  //   address: 'Peninsula Square, London SE10 0DX',
  //   date: '5th SEPTEMBER 2026',
  //   time: '7:30 PM',
  //   mapUrl: 'https://maps.google.com/?q=The+O2+Arena+London',
  //   imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  //   capacity: '20,000 seats',
  //   features: ['Premium Lounges', 'Bars & Restaurants', 'Easy Transport', 'Shopping'],
  //   ticketsOpen : false,
  //   eventId: '5b23904a-2ba5-4bbe-ae62-acacbe4677cb'
  // },
  // {
  //   id: 'birmingham',
  //   name: 'Resorts World Arena',
  //   location: 'Birmingham, UK',
  //   address: 'Pendigo Way, Birmingham B40 1PU',
  //   date: '12th SEPTEMBER 2026',
  //   time: '6:30 PM',
  //   mapUrl: 'https://maps.google.com/?q=Resorts+World+Arena+Birmingham',
  //   imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  //   capacity: '15,600 seats',
  //   features: ['Hotel On-site', 'Restaurants', 'Parking', 'VIP Access'],
  //   ticketsOpen : false,
  //   eventId: '5b23904a-2ba5-4bbe-ae62-acacbe4677cb'
  // }
];

export const ARTIST_DATA: Artist[] = [
  {
    id: 1,
    name: 'NADIR SHAH',
    role: 'Show Director',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Nadirshah2016SOP.jpg',
    bio: 'Award-winning performer and show director with over 15 years of experience in live entertainment. Known for his dynamic stage presence and innovative direction.',
    social: {
      instagram: '@nadirshahofficial',
      twitter: '@nadirshah'
    }
  },
  {
    id: 2,
    name: 'Samad Sulaiman',
    role: 'Actor & Singer',
    imageUrl: 'https://m3db.com/sites/default/files/styles/artist_profile_pic_zoom/public/artists-profile-photos/Samad%20Sulaiman.jpg?itok=94DSOywU',
    bio: 'Powerhouse vocalist with a range that captivates audiences. Has performed in over 500 shows worldwide and collaborated with top artists.',
    social: {
      instagram: '@pauljohnmusic',
      facebook: '@pauljohnofficial'
    }
  },
  {
    id: 3,
    name: 'RANJINI JOSE',
    role: 'Lead Vocalist',
    imageUrl: 'assets/images/events/nadirshow/artist/ranjini.jpg',
    bio: 'Acclaimed choreographer known for fusion of contemporary and traditional styles. Has won multiple dance awards and trained performers worldwide.',
    social: {
      instagram: '@ranjinijose',
      twitter: '@ranjinidance'
    }
  },
  {
    id: 4,
    name: 'Dayyana Hameed',
    role: 'Actress',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BODI0NmUyMzgtMzM2Yi00NzVlLWFmYmItYjcyMThmMDBkMzNjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    bio: 'Musical genius behind the live orchestra. Composer and producer with a unique ability to blend genres and create unforgettable musical experiences.',
    social: {
      instagram: '@roxonmusic',
      twitter: '@roxonlive'
    }
  },
  {
    id: 5,
    name: 'Aswanth Anilkumar',
    role: 'Mimic & Comedian',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfpf_lXMy35GQ-s5Cw-I5lr8IS7KqJyO9b-g&s',
    bio: 'Guitar virtuoso known for electrifying solos and melodic compositions. Has shared stage with international artists and headlined major festivals.',
    social: {
      instagram: '@jinsoguitar',
      facebook: '@jinsomusic'
    }
  },
  {
    id: 6,
    name: 'Bijesh Chelari',
    role: 'Mimic & Comedian',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiLkK7Hrg2BNEVhcZnrR1C-ZlUOrgP9GLomQ&s',
    bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
    social: {
      instagram: '@dayanahameed',
      twitter: '@dayanasings'
    }
  },
  {
    id: 7,
    name: 'Dream Team UK',
    role: 'Dance troupe',
    imageUrl: 'assets/images/events/nadirshow/artist/dreamteam.jpeg',
    bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
    social: {
      instagram: '@dayanahameed',
      twitter: '@dayanasings'
    }
  },
  {
    id: 8,
    name: 'Jinso Davis',
    role: 'Director & Singer',
    imageUrl: 'assets/images/events/nadirshow/artist/Jinso.PNG',
    bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
    social: {
      instagram: '@dayanahameed',
      twitter: '@dayanasings'
    }
  },
  {
    id: 9,
    name: 'Roxon D\u0027Cruz',
    role: 'Director & DJ',
    imageUrl: 'assets/images/events/nadirshow/artist/Roxon.PNG',
    bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
    social: {
      instagram: '@dayanahameed',
      twitter: '@dayanasings'
    }
  },
  {
    id: 10,
    name: 'Jojo Mathew',
    role: 'Drums',
    imageUrl: 'assets/images/events/nadirshow/artist/JojoMathew.jpeg',
    bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
    social: {
      instagram: '@dayanahameed',
      twitter: '@dayanasings'
    }
  },
  {
    id: 11,
    name: 'Mathew',
    role: 'Tabla',
    imageUrl: 'assets/images/events/nadirshow/artist/mathew.jpeg',
    bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
    social: {
      instagram: '@dayanahameed',
      twitter: '@dayanasings'
    }
  },
  {
    id: 11,
    name: 'Sambath Selam',
    role: 'Trapeze Artist',
    imageUrl: 'assets/images/events/nadirshow/artist/Sambath.jpeg',
    bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
    social: {
      instagram: '@dayanahameed',
      twitter: '@dayanasings'
    }
  }
];

export const SPONSOR_DATA: Sponsor[] = [
  { name: 'R&J EVENTS', logo: 'https://placehold.co/200x100/ffd700/0a0815?text=R%26J', tier: 'platinum' },
  { name: 'LIFE LINE PROTECT', logo: 'https://placehold.co/200x100/ffd700/0a0815?text=LIFE+LINE%0APROTECT', tier: 'platinum' },
  { name: 'PAUL JOHN & CO SOLICITORS', logo: 'https://placehold.co/200x100/ffd700/0a0815?text=PAUL+JOHN%0ASOLICITORS', tier: 'platinum' }
];

export const CONTACT_DATA: Contact[] = [
  { number: '+44 7534 446526', name: 'JINSO', icon: 'fa-ticket' },
  { number: '+44 7880 111939', name: 'General Inquiries', icon: 'fa-phone' },
  { number: '+44 7480 198786', name: 'ROXON', icon: 'fa-music' }
];

export const EVENT_CONFIG: EventConfig = {
  logo: {
    text: 'R & J EVENTS',
    year: 'Manchester Gems'
  },
  navLinks: [
    { label: 'HOME', section: 'home' },
    { label: 'ARTISTS', section: 'artists' },
    { label: 'VENUES', section: 'venues' },
    { label: 'SPONSORS', section: 'sponsors' }
  ],
  bannerImages: [
    'assets/images/events/nadirshow/banner1.jpeg',
    'assets/images/events/nadirshow/banner2.jpeg',
    'assets/images/events/nadirshow/banner3.jpeg'
  ],
  presenters: ['R&J EVENTS', 'LIFE PROTECT', 'PROUDLY PRESENCE'],
  stats: [
    { number: '4', label: 'CITIES' },
    { number: '15+', label: 'ARTISTS' },
    { number: '20K+', label: 'FANS' }
  ],
  mainTitle: {
    line1: 'NADIR 2K26',
    line2: 'SHOW @UK',
    year: '2026'
  },
  tagline: 'NONSTOP MUSIC, DANCE & MIMICS',
  productions: [
    { icon: 'fa-music', title: 'LIVE ORCHESTRA', description: '15 Piece Band' },
    { icon: 'fa-user', title: '6 DANCERS', description: 'Professional Crew' },
    { icon: 'fa-volume-up', title: 'SOUND ENGINEER', description: 'Dolby Atmos' },
    { icon: 'fa-lightbulb', title: 'LIGHTING DESIGN', description: 'LED Wall & Lasers' }
  ],
  year: '2026'
};