// Build-time config for the LITTLECREW subdomain (a per-organizer site on the CrowdPass platform).
//   ng build --configuration littlecrew   |   ng serve --configuration littlecrew
// Runs against the SAME CrowdPass backend/DB as crowdpass; only the branding + organizer filter
// differ. Theme is Little Crew's own Royal Purple & Magenta dark look (styles.littlecrew.scss,
// wired in angular.json for this config) — separate from the crowdpass/manickath palette.
//
// organizerId scopes this subdomain to one organizer (the backend applies the filter). It MUST
// match the OrganizerId stamped on the Little Crew event in the DB
// (see scripts/seed-littlecrew-anarkali.sql).
export const environment = {
  production: true,
  apiUrl: 'https://crowdpass.azurewebsites.net',
  organizerId: '1C1EC700-0000-4000-9000-0000000000CC' as string | null,   // Little Crew & Co organizer
  appName: 'Little Crew & Co',
  identityUrl: '',
  identityAPIUrl: '',
  stripe: {
    // Mirrors environment.crowdpass.ts (CrowdPass supplies the publishable key for this platform).
    testmode: false,
    publishableKey: '',
    testpublishableKey: ''
  },
  theme: {
    id: 'littlecrew',
    name: 'Little Crew & Co',
    domain: 'littlecrew.crowdpass.co.uk',
    company: {
      name: 'Little Crew & Co',
      logo: { text: 'LITTLE CREW', sublabel: '& CO', color: '#E9499A', backgroundColor: '#140B1F' },
      logoImage: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/littlecrew/littlecrew-logo.png',
      favicon: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/littlecrew/littlecrew-logo.png',
      primaryColor: '#140B1F',
      secondaryColor: '#E9499A',
      accentColor: '#B06CF2',
      contact: { phone: '07388390443', email: 'hello@littlecrewco.com', address: 'Maidstone Leisure Centre, Mote Park, Maidstone, Kent, ME15 7RN' }
    },
    navigation: {
      menuItems: [
        { label: 'Home', routerLink: '/', type: 'home', external: false },
        { label: 'Events', routerLink: '/events', type: 'events', external: false },
        // External pages hosted on the main Little Crew site (open in a new tab).
        { label: 'Contact', routerLink: 'https://littlecrewco.com', type: 'custom', external: true }
      ],
      showSearch: false,
      showCart: true
    },
    theme: {
      backgroundColor: '#140B1F',
      textColor: '#F4EEF9',
      buttonColor: '#E9499A',
      buttonTextColor: '#FFFFFF',
      glassBackground: 'rgba(255, 255, 255, 0.05)',
      glassBorder: 'rgba(233, 73, 154, 0.22)',
      headerStyle: 'minimal'
    },
    features: { enableAuth: true, enableCart: true, enableSearch: false, showContactInfo: true }
  }
};
