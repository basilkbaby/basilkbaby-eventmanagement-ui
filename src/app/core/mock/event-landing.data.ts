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

export interface HeroSponsor {
  name: string;
  logo: string;
}

export interface EventConfig {
  logo: {
    text: string;
    year: string;
    logoUrl?: string;
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
  eyebrow: string;
  tags: string[];
  supportArtistsLines: string[];
  leadArtists: string[];
  mainSponsors: HeroSponsor[];
  supportingSponsors: HeroSponsor[];
}

export interface CompanyEventData {
  companyId: string;
  venues: Venue[];
  artists: Artist[];
  sponsors: Sponsor[];
  contacts: Contact[];
  eventConfig: EventConfig;
}

const MANCHESTERGEMS_DATA: CompanyEventData = {
  companyId: 'manchestergems',
  venues: [
    {
      id: 'blackpool',
      name: 'Winter Gardens Blackpool',
      location: 'Blackpool',
      address: '97 Church St., Blackpool FY1 1HL',
      date: '22nd AUGUST 2026',
      time: '6:00 PM',
      gateopentime: '5:00 PM',
      mapUrl: 'https://maps.google.com/?q=Winter+Gardens+Blackpool',
      imageUrl: 'https://www.creativetourist.com/app/uploads/2020/12/367e8f571aa80544cd66907f2acf31aa.jpg',
      capacity: '1,000 seats',
      features: ['Live Orchestra', 'Disabled Access', 'Parking Available'],
      ticketsOpen: true,
      eventId: '5b23904a-2ba5-4bbe-ae62-acacbe4677cb'
    }
  ],
  artists: [
    {
      id: 0,
      name: 'Dilieep',
      role: 'Staring',
      imageUrl: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/dileep.jpeg',
      bio: 'Award-winning performer and show director with over 15 years of experience in live entertainment. Known for his dynamic stage presence and innovative direction.',
      social: { instagram: '@nadirshahofficial', twitter: '@nadirshah' }
    },
    {
      id: 1,
      name: 'NADIR SHAH',
      role: 'Show Director',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Nadirshah2016SOP.jpg',
      bio: 'Award-winning performer and show director with over 15 years of experience in live entertainment. Known for his dynamic stage presence and innovative direction.',
      social: { instagram: '@nadirshahofficial', twitter: '@nadirshah' }
    },
    {
      id: 2,
      name: 'Samad Sulaiman',
      role: 'Actor & Singer',
      imageUrl: 'https://m3db.com/sites/default/files/styles/artist_profile_pic_zoom/public/artists-profile-photos/Samad%20Sulaiman.jpg?itok=94DSOywU',
      bio: 'Powerhouse vocalist with a range that captivates audiences. Has performed in over 500 shows worldwide and collaborated with top artists.',
      social: { instagram: '@pauljohnmusic', facebook: '@pauljohnofficial' }
    },
    {
      id: 3,
      name: 'RANJINI JOSE',
      role: 'Lead Vocalist',
      imageUrl: 'assets/images/events/nadirshow/artist/ranjini.jpg',
      bio: 'Acclaimed choreographer known for fusion of contemporary and traditional styles. Has won multiple dance awards and trained performers worldwide.',
      social: { instagram: '@ranjinijose', twitter: '@ranjinidance' }
    },
    {
      id: 4,
      name: 'Dayyana Hameed',
      role: 'Actress',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BODI0NmUyMzgtMzM2Yi00NzVlLWFmYmItYjcyMThmMDBkMzNjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      bio: 'Musical genius behind the live orchestra. Composer and producer with a unique ability to blend genres and create unforgettable musical experiences.',
      social: { instagram: '@roxonmusic', twitter: '@roxonlive' }
    },
    {
      id: 5,
      name: 'Aswanth Anilkumar',
      role: 'Mimic & Comedian',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfpf_lXMy35GQ-s5Cw-I5lr8IS7KqJyO9b-g&s',
      bio: 'Guitar virtuoso known for electrifying solos and melodic compositions. Has shared stage with international artists and headlined major festivals.',
      social: { instagram: '@jinsoguitar', facebook: '@jinsomusic' }
    },
    {
      id: 6,
      name: 'Bijesh Chelari',
      role: 'Mimic & Comedian',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiLkK7Hrg2BNEVhcZnrR1C-ZlUOrgP9GLomQ&s',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 7,
      name: 'Dream Team UK',
      role: 'Dance troupe',
      imageUrl: 'assets/images/events/nadirshow/artist/dreamteam.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 8,
      name: 'Jinso Davis',
      role: 'Director & Singer',
      imageUrl: 'assets/images/events/nadirshow/artist/Jinso.PNG',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 9,
      name: "Roxon D'Cruz",
      role: 'Director & DJ',
      imageUrl: 'assets/images/events/nadirshow/artist/Roxon.PNG',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 10,
      name: 'Jojo Mathew',
      role: 'Drums',
      imageUrl: 'assets/images/events/nadirshow/artist/JojoMathew.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 11,
      name: 'Mathew',
      role: 'Tabla',
      imageUrl: 'assets/images/events/nadirshow/artist/mathew.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 12,
      name: 'Sambath Selam',
      role: 'Trapeze Artist',
      imageUrl: 'assets/images/events/nadirshow/artist/Sambath.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 13,
      name: 'Sunil Prayag',
      role: 'Keyboard',
      imageUrl: 'assets/images/events/nadirshow/artist/Sunil.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    }
  ],
  sponsors: [
    { name: 'R&J EVENTS', logo: 'https://placehold.co/200x100/ffd700/0a0815?text=R%26J', tier: 'platinum' },
    { name: 'LIFE LINE PROTECT', logo: 'https://placehold.co/200x100/ffd700/0a0815?text=LIFE+LINE%0APROTECT', tier: 'platinum' },
    { name: 'PAUL JOHN & CO SOLICITORS', logo: 'https://placehold.co/200x100/ffd700/0a0815?text=PAUL+JOHN%0ASOLICITORS', tier: 'platinum' }
  ],
  contacts: [
    { number: '+44 7534 446526', name: 'JINSO', icon: 'fa-ticket' },
    { number: '+44 7880 111939', name: 'General Inquiries', icon: 'fa-phone' },
    { number: '+44 7480 198786', name: 'ROXON', icon: 'fa-music' }
  ],
  eventConfig: {
    logo: { text: 'R & J EVENTS', year: 'Manchester Gems' },
    navLinks: [
      { label: 'Home', section: 'home' },
      { label: 'Artists', section: 'artists' },
      { label: 'Venues', section: 'venues' },
      { label: 'Terms and Conditions', section: 'privacy' },
      { label: 'Contact Us', section: 'contactus' }
    ],
    bannerImages: ['https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah-dileep-blackpoolv1.PNG'],
    presenters: ['R&J EVENTS', 'LIFE PROTECT', 'PROUDLY PRESENCE'],
    stats: [
      { number: '4', label: 'CITIES' },
      { number: '15+', label: 'ARTISTS' },
      { number: '20K+', label: 'FANS' }
    ],
    mainTitle: { line1: 'Dilieep Nadir', line2: 'Show @ Uk', year: '2026' },
    tagline: 'NONSTOP MUSIC, DANCE & MIMICS',
    productions: [
      { icon: 'fa-music', title: 'LIVE ORCHESTRA', description: '15 Piece Band' },
      { icon: 'fa-user', title: '6 DANCERS', description: 'Professional Crew' },
      { icon: 'fa-volume-up', title: 'SOUND ENGINEER', description: 'Dolby Atmos' },
      { icon: 'fa-lightbulb', title: 'LIGHTING DESIGN', description: 'LED Wall & Lasers' }
    ],
    year: '2026',
    eyebrow: 'R&J Events Presents',
    tags: ['100% Entertainment', 'Nonstop Music', 'Dance & Mimics'],
    supportArtistsLines: [
      'Aswanth Anilkumar (Mimicry) · Bijesh Chelari (Mimicry) · Sambath (Special Act)',
      'Roxon · Jinso · Sunil Mundakkayam · Jojo Mathew · Live Orchestra & Dancers'
    ],
    leadArtists: ['Nadirshah', 'Ranjini Jose', 'Samad Sulaiman', 'Dayana Hameed'],
    mainSponsors: [
      { name: 'Idealistic Mortgage & Insurance', logo: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah/idealistic.jpeg' },
      { name: 'Keram Restaurant & Bar',        logo: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah/Keram.jpeg' },
      { name: 'Paul John & Co Solicitors', logo: 'assets/images/events/nadirshow/sponsors/pjc.svg' },
      { name: 'Shan Properties',           logo: 'assets/images/events/nadirshow/sponsors/shan.jpg' },
    ],
    supportingSponsors: [
      { name: 'Chrystal Hyper Market', logo: 'assets/images/events/nadirshow/sponsors/chrystal-hyper-market.png' },
      { name: 'Family Shop',           logo: 'assets/images/events/nadirshow/sponsors/family-shop.png' },
      { name: 'Seacom Accountancy',    logo: 'assets/images/events/nadirshow/sponsors/seacom-accountancy.png' },
      { name: 'Music List',            logo: 'assets/images/events/nadirshow/sponsors/music-list.png' },
      { name: 'Ethal',                 logo: 'assets/images/events/nadirshow/sponsors/ethal.png' }
    ]
  }
};

const VANCHI_DATA: CompanyEventData = {
  companyId: 'vanchi',
  venues: [
    {
      id: 'maidstone',
      name: 'Maidstone Leisure Centre',
      location: 'Maidstone',
      address: 'Maidstone Leisure Centre, ME15 7RN',
      date: '4th SEPTEMBER 2026',
      time: '6:00 PM',
      gateopentime: '5:00 PM',
      mapUrl: 'https://maps.google.com/?q=Maidstone+Leisure+Centre+ME15+7RN',
      imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      capacity: '1,000 seats',
      features: ['Live Orchestra', 'Disabled Access', 'Parking Available'],
      ticketsOpen: true,
      eventId: '75bba2fa-17d9-490e-9186-1563cf5b0fee'
    }
  ],
  artists: [ 
    {
      id: 1,
      name: 'Dilieep',
      role: 'Staring',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-NdoA-IhnpKTyHR2N2PdKBSWeCAyzNM2eVZzFn5Otl217d0FBd6GsjMY28fLHDwb-AJpNOD4jxsMZqxqQY0U6q-L1EGFyUgmQcZaI6D4&s=10',
      bio: 'Award-winning performer and show director with over 15 years of experience in live entertainment. Known for his dynamic stage presence and innovative direction.',
      social: { instagram: '@nadirshahofficial', twitter: '@nadirshah' }
    },
    {
      id: 11,
      name: 'NADIR SHAH',
      role: 'Show Director',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Nadirshah2016SOP.jpg',
      bio: 'Award-winning performer and show director with over 15 years of experience in live entertainment. Known for his dynamic stage presence and innovative direction.',
      social: { instagram: '@nadirshahofficial', twitter: '@nadirshah' }
    },
    {
      id: 2,
      name: 'Samad Sulaiman',
      role: 'Actor & Singer',
      imageUrl: 'https://m3db.com/sites/default/files/styles/artist_profile_pic_zoom/public/artists-profile-photos/Samad%20Sulaiman.jpg?itok=94DSOywU',
      bio: 'Powerhouse vocalist with a range that captivates audiences. Has performed in over 500 shows worldwide and collaborated with top artists.',
      social: { instagram: '@pauljohnmusic', facebook: '@pauljohnofficial' }
    },
    {
      id: 3,
      name: 'RANJINI JOSE',
      role: 'Lead Vocalist',
      imageUrl: 'assets/images/events/nadirshow/artist/ranjini.jpg',
      bio: 'Acclaimed choreographer known for fusion of contemporary and traditional styles. Has won multiple dance awards and trained performers worldwide.',
      social: { instagram: '@ranjinijose', twitter: '@ranjinidance' }
    },
    {
      id: 4,
      name: 'Dayyana Hameed',
      role: 'Actress',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BODI0NmUyMzgtMzM2Yi00NzVlLWFmYmItYjcyMThmMDBkMzNjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      bio: 'Musical genius behind the live orchestra. Composer and producer with a unique ability to blend genres and create unforgettable musical experiences.',
      social: { instagram: '@roxonmusic', twitter: '@roxonlive' }
    },
    {
      id: 5,
      name: 'Aswanth Anilkumar',
      role: 'Mimic & Comedian',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfpf_lXMy35GQ-s5Cw-I5lr8IS7KqJyO9b-g&s',
      bio: 'Guitar virtuoso known for electrifying solos and melodic compositions. Has shared stage with international artists and headlined major festivals.',
      social: { instagram: '@jinsoguitar', facebook: '@jinsomusic' }
    },
    {
      id: 6,
      name: 'Bijesh Chelari',
      role: 'Mimic & Comedian',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiLkK7Hrg2BNEVhcZnrR1C-ZlUOrgP9GLomQ&s',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 7,
      name: 'Dream Team UK',
      role: 'Dance troupe',
      imageUrl: 'assets/images/events/nadirshow/artist/dreamteam.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 8,
      name: 'Jinso Davis',
      role: 'Director & Singer',
      imageUrl: 'assets/images/events/nadirshow/artist/Jinso.PNG',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 9,
      name: "Roxon D'Cruz",
      role: 'Director & DJ',
      imageUrl: 'assets/images/events/nadirshow/artist/Roxon.PNG',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 10,
      name: 'Jojo Mathew',
      role: 'Drums',
      imageUrl: 'assets/images/events/nadirshow/artist/JojoMathew.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 11,
      name: 'Mathew',
      role: 'Tabla',
      imageUrl: 'assets/images/events/nadirshow/artist/mathew.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 12,
      name: 'Sambath Selam',
      role: 'Trapeze Artist',
      imageUrl: 'assets/images/events/nadirshow/artist/Sambath.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 13,
      name: 'Sunil Prayag',
      role: 'Keyboard',
      imageUrl: 'assets/images/events/nadirshow/artist/Sunil.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences. Trained in multiple genres and brings emotional depth to every performance.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    }
  ],
  sponsors: [
    { name: 'VANCHI SOUTH INDIAN RESTURANT', logo: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah/vanchi.jpeg', tier: 'platinum' },
  ],
  contacts: [
    { number: '07817105925', name: 'Sujith', icon: 'fa-ticket' },
    { number: '07578776316', name: 'Sneha', icon: 'fa-phone' },
    { number: 'vanchirestaurantltd@gmail.com', name: 'Email', icon: 'fa-envelope' }
  ],
  eventConfig: {
    logo: { text: 'VANCHI SOUTH INDIAN RESTURANT', year: 'Vanchi 2026', logoUrl: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah/vanchi.jpeg' },
    navLinks: [
      { label: 'Home', section: 'home' },
      { label: 'Artists', section: 'artists' },
      { label: 'Venues', section: 'venues' },
      { label: 'Terms and Conditions', section: 'privacy' },
      { label: 'Contact Us', section: 'contactus' }
    ],
    bannerImages: ['https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah/nadirshah-dileep.jpeg'],
    presenters: ['VANCHI SOUTH INDIAN RESTURANT', 'KERALA KUTTIES UK', 'DESI CONNECT'],
    stats: [
      { number: '2', label: 'CITIES' },
      { number: '10+', label: 'ARTISTS' },
      { number: '5K+', label: 'FANS' }
    ],
    mainTitle: { line1: 'Dilieep & Nadirshow ', line2: '@ Uk 2K26', year: '2026' },
    tagline: 'MUSIC, COMEDY & DANCE EXTRAVAGANZA',
    productions: [
      { icon: 'fa-music', title: 'LIVE ORCHESTRA', description: '15 Piece Band' },
      { icon: 'fa-user', title: '6 DANCERS', description: 'Professional Crew' },
      { icon: 'fa-volume-up', title: 'SOUND ENGINEER', description: 'Dolby Atmos' },
      { icon: 'fa-lightbulb', title: 'LIGHTING DESIGN', description: 'LED Wall & Lasers' }
    ],
    year: '2026',
    eyebrow: 'VANCHI SOUTH INDIAN RESTURANT Presents',
    tags: ['100% Entertainment', 'Nonstop Music', 'Comedy & Dance'],
    supportArtistsLines: [
      'Aswanth Anilkumar (Mimicry) · Bijesh Chelari (Mimicry) · Sambath (Special Act)',
      'Roxon · Jinso · Sunil Mundakkayam · Jojo Mathew · Live Orchestra & Dancers'
    ],
    leadArtists: ['Dilieep', 'Nadirshah', 'Ranjini Jose', 'Samad Sulaiman', 'Dayana Hameed'],
    mainSponsors: [
      { name: 'VANCHI SOUTH INDIAN RESTURANT',     logo: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah/vanchi.jpeg' },
      { name: 'Excellent Financial Services', logo: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/nadirshah/excellent.jpg' },
    ],
    supportingSponsors: [
    ]
  }
};

export const ALL_COMPANY_EVENT_DATA: CompanyEventData[] = [
  MANCHESTERGEMS_DATA,
  VANCHI_DATA
];

export function getEventData(companyId: string): CompanyEventData {
  return ALL_COMPANY_EVENT_DATA.find(d => d.companyId === companyId) ?? MANCHESTERGEMS_DATA;
}
