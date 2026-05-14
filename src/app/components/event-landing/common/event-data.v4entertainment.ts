import { EventDataSet } from './event-data.types';

export const v4entertainmentData: EventDataSet = {
  venues: [
    {
      id: 'manchester',
      name: 'Forum Centre Manchester',
      location: 'Manchester',
      address: 'Forum Centre, Manchester',
      date: '31st OCTOBER 2026',
      time: '6:00 PM',
      gateopentime: '5:00 PM',
      mapUrl: 'https://maps.google.com/?q=Forum+Centre+Manchester',
      imageUrl: 'assets/images/events/sreekumar/venues/manchester.jpg',
      capacity: 'TBC',
      features: ['Live Orchestra', 'Disabled Access', 'Parking Available'],
      ticketsOpen: true,
      eventId: 'REPLACE_WITH_MANCHESTER_EVENT_ID'
    },
    {
      id: 'cardiff',
      name: 'Memo Arts Centre',
      location: 'Cardiff',
      address: 'Memo Arts Centre, Cardiff',
      date: '1st NOVEMBER 2026',
      time: '6:00 PM',
      gateopentime: '5:00 PM',
      mapUrl: 'https://maps.google.com/?q=Memo+Arts+Centre+Cardiff',
      imageUrl: 'assets/images/events/sreekumar/venues/cardiff.jpg',
      capacity: 'TBC',
      features: ['Live Orchestra', 'Disabled Access'],
      ticketsOpen: true,
      eventId: 'REPLACE_WITH_CARDIFF_EVENT_ID'
    },
    {
      id: 'london',
      name: 'The Royal Regency',
      location: 'London',
      address: 'The Royal Regency, London',
      date: '6th NOVEMBER 2026',
      time: '6:00 PM',
      gateopentime: '5:00 PM',
      mapUrl: 'https://maps.google.com/?q=The+Royal+Regency+London',
      imageUrl: 'assets/images/events/sreekumar/venues/london.jpg',
      capacity: 'TBC',
      features: ['Live Orchestra', 'Disabled Access', 'Parking Available'],
      ticketsOpen: true,
      eventId: 'REPLACE_WITH_LONDON_EVENT_ID'
    },
    {
      id: 'southampton',
      name: 'Kings Conference Centre',
      location: 'Southampton',
      address: 'Kings Conference Centre, Southampton',
      date: 'TBC',
      time: '6:00 PM',
      gateopentime: '5:00 PM',
      mapUrl: 'https://maps.google.com/?q=Kings+Conference+Centre+Southampton',
      imageUrl: 'assets/images/events/sreekumar/venues/southampton.jpg',
      capacity: 'TBC',
      features: ['Live Orchestra', 'Disabled Access', 'Parking Available'],
      ticketsOpen: false,
      eventId: 'REPLACE_WITH_SOUTHAMPTON_EVENT_ID'
    },
    {
      id: 'leicester',
      name: 'Maher Centre',
      location: 'Leicester',
      address: 'Maher Centre, Leicester',
      date: 'TBC',
      time: '6:00 PM',
      gateopentime: '5:00 PM',
      mapUrl: 'https://maps.google.com/?q=Maher+Centre+Leicester',
      imageUrl: 'assets/images/events/sreekumar/venues/leicester.jpg',
      capacity: 'TBC',
      features: ['Live Orchestra', 'Disabled Access'],
      ticketsOpen: false,
      eventId: 'REPLACE_WITH_LEICESTER_EVENT_ID'
    }
  ],

  artists: [
    {
      id: 1,
      name: 'MG SREEKUMAR',
      role: 'Lead Vocalist',
      isLead: true,
      imageUrl: 'assets/images/events/sreekumar/artist/sreekumar.jpg',
      bio: 'Legendary Malayalam playback singer with decades of timeless hits that have moved millions of hearts.',
      social: {
        facebook: 'https://www.facebook.com/100064091761454'
      }
    }
  ],

  sponsors: [],

  contacts: [
    { number: 'TBC', name: 'V4 Entertainment', icon: 'fa-phone' }
  ],

  config: {
    logo: { text: 'V4 ENTERTAINMENT', year: 'MG Sreekumar Live' },
    eyebrow: 'V4 Entertainment Presents',
    heroTags: ['Live in UK', 'Timeless Melodies', 'Grand Celebration'],
    navLinks: [
      { label: 'HOME',    section: 'home'      },
      { label: 'ARTISTS', section: 'artists'   },
      { label: 'VENUES',  section: 'venues'    },
      { label: 'CONTACT', section: 'contactus' }
    ],
    bannerImages: ['assets/images/events/sreekumar/banner1.jpg'],
    presenters: ['V4 ENTERTAINMENT'],
    stats: [
      { number: '5',    label: 'CITIES'  },
      { number: '1+',   label: 'ARTISTS' },
      { number: '10K+', label: 'FANS'    }
    ],
    mainTitle: { line1: 'MG SREEKUMAR', line2: 'LIVE IN UK', year: '2026' },
    tagline: 'AN EVENING OF TIMELESS MELODIES',
    productions: [
      { icon: 'fa-music',     title: 'LIVE ORCHESTRA',  description: 'Full Band'           },
      { icon: 'fa-volume-up', title: 'SOUND ENGINEER',  description: 'Professional Sound'  },
      { icon: 'fa-lightbulb', title: 'LIGHTING DESIGN', description: 'Stage Production'    }
    ],
    year: '2026'
  }
};
