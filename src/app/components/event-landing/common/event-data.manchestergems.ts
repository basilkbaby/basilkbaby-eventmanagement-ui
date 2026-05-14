import { EventDataSet } from './event-data.types';

export const manchesterGemsData: EventDataSet = {
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
      id: 1,
      name: 'NADIR SHAH',
      role: 'Show Director',
      isLead: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Nadirshah2016SOP.jpg',
      bio: 'Award-winning performer and show director with over 15 years of experience in live entertainment.',
      social: { instagram: '@nadirshahofficial', twitter: '@nadirshah' }
    },
    {
      id: 2,
      name: 'Samad Sulaiman',
      role: 'Actor & Singer',
      isLead: true,
      imageUrl: 'https://m3db.com/sites/default/files/styles/artist_profile_pic_zoom/public/artists-profile-photos/Samad%20Sulaiman.jpg?itok=94DSOywU',
      bio: 'Powerhouse vocalist with a range that captivates audiences.',
      social: { instagram: '@pauljohnmusic', facebook: '@pauljohnofficial' }
    },
    {
      id: 3,
      name: 'RANJINI JOSE',
      role: 'Lead Vocalist',
      isLead: true,
      imageUrl: 'assets/images/events/nadirshow/artist/ranjini.jpg',
      bio: 'Acclaimed choreographer known for fusion of contemporary and traditional styles.',
      social: { instagram: '@ranjinijose', twitter: '@ranjinidance' }
    },
    {
      id: 4,
      name: 'Dayyana Hameed',
      role: 'Actress',
      isLead: true,
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BODI0NmUyMzgtMzM2Yi00NzVlLWFmYmItYjcyMThmMDBkMzNjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      bio: 'Musical genius behind the live orchestra.',
      social: { instagram: '@roxonmusic', twitter: '@roxonlive' }
    },
    {
      id: 5,
      name: 'Aswanth Anilkumar',
      role: 'Mimic & Comedian',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfpf_lXMy35GQ-s5Cw-I5lr8IS7KqJyO9b-g&s',
      bio: 'Guitar virtuoso known for electrifying solos and melodic compositions.',
      social: { instagram: '@jinsoguitar', facebook: '@jinsomusic' }
    },
    {
      id: 6,
      name: 'Bijesh Chelari',
      role: 'Mimic & Comedian',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiLkK7Hrg2BNEVhcZnrR1C-ZlUOrgP9GLomQ&s',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 7,
      name: 'Dream Team UK',
      role: 'Dance troupe',
      imageUrl: 'assets/images/events/nadirshow/artist/dreamteam.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 8,
      name: 'Jinso Davis',
      role: 'Director & Singer',
      imageUrl: 'assets/images/events/nadirshow/artist/Jinso.PNG',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 9,
      name: "Roxon D'Cruz",
      role: 'Director & DJ',
      imageUrl: 'assets/images/events/nadirshow/artist/Roxon.PNG',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 10,
      name: 'Jojo Mathew',
      role: 'Drums',
      imageUrl: 'assets/images/events/nadirshow/artist/JojoMathew.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 11,
      name: 'Mathew',
      role: 'Tabla',
      imageUrl: 'assets/images/events/nadirshow/artist/mathew.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 12,
      name: 'Sambath Selam',
      role: 'Trapeze Artist',
      imageUrl: 'assets/images/events/nadirshow/artist/Sambath.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    },
    {
      id: 13,
      name: 'Sunil Prayag',
      role: 'Keyboard',
      imageUrl: 'assets/images/events/nadirshow/artist/Sunil.jpeg',
      bio: 'Versatile singer with a soulful voice that moves audiences.',
      social: { instagram: '@dayanahameed', twitter: '@dayanasings' }
    }
  ],

  sponsors: [
    { name: 'Kerala Curry House',        logo: 'assets/images/events/nadirshow/sponsors/curryhouse.jpg',            tier: 'platinum' },
    { name: 'Paul John & Co Solicitors', logo: 'assets/images/events/nadirshow/sponsors/pjc.svg',                  tier: 'platinum' },
    { name: 'Shan Properties',           logo: 'assets/images/events/nadirshow/sponsors/shan.jpg',                  tier: 'platinum' },
    { name: 'Life Line Mortgage',        logo: 'assets/images/events/nadirshow/sponsors/lifeline.png',              tier: 'platinum' },
    { name: 'Chrystal Hyper Market',     logo: 'assets/images/events/nadirshow/sponsors/chrystal-hyper-market.png', tier: 'silver'   },
    { name: 'Family Shop',               logo: 'assets/images/events/nadirshow/sponsors/family-shop.png',           tier: 'silver'   },
    { name: 'Seacom Accountancy',        logo: 'assets/images/events/nadirshow/sponsors/seacom-accountancy.png',    tier: 'silver'   },
    { name: 'Music List',                logo: 'assets/images/events/nadirshow/sponsors/music-list.png',             tier: 'silver'   },
    { name: 'Ethal',                     logo: 'assets/images/events/nadirshow/sponsors/ethal.png',                  tier: 'silver'   }
  ],

  contacts: [
    { number: '+44 7534 446526', name: 'JINSO',             icon: 'fa-ticket' },
    { number: '+44 7880 111939', name: 'General Inquiries', icon: 'fa-phone'  },
    { number: '+44 7480 198786', name: 'ROXON',             icon: 'fa-music'  }
  ],

  config: {
    logo: { text: 'R & J EVENTS', year: 'Manchester Gems' },
    eyebrow: 'R&J Events Presents',
    heroTags: ['100% Entertainment', 'Nonstop Music', 'Dance & Mimics'],
    navLinks: [
      { label: 'HOME',     section: 'home'     },
      { label: 'ARTISTS',  section: 'artists'  },
      { label: 'VENUES',   section: 'venues'   },
      { label: 'SPONSORS', section: 'sponsors' }
    ],
    bannerImages: ['assets/images/events/nadirshow/banner1.jpeg'],
    presenters: ['R&J EVENTS', 'LIFE PROTECT', 'PROUDLY PRESENCE'],
    stats: [
      { number: '4',   label: 'CITIES'  },
      { number: '15+', label: 'ARTISTS' },
      { number: '20K+', label: 'FANS'   }
    ],
    mainTitle: { line1: 'NADIR 2K26', line2: 'SHOW @UK', year: '2026' },
    tagline: 'NONSTOP MUSIC, DANCE & MIMICS',
    productions: [
      { icon: 'fa-music',     title: 'LIVE ORCHESTRA',  description: '15 Piece Band'      },
      { icon: 'fa-user',      title: '6 DANCERS',       description: 'Professional Crew'  },
      { icon: 'fa-volume-up', title: 'SOUND ENGINEER',  description: 'Dolby Atmos'        },
      { icon: 'fa-lightbulb', title: 'LIGHTING DESIGN', description: 'LED Wall & Lasers'  }
    ],
    year: '2026'
  }
};
