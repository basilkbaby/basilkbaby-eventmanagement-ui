// Build-time config for the MANICKATH subdomain (a per-organizer site on the CrowdPass platform).
//   ng build --configuration manickath   |   ng serve --configuration manickath
// Runs against the SAME CrowdPass backend/DB as crowdpass; only the branding + (later) organizer
// filter differ. Theme reuses the CrowdPass dark+gold look (styles.crowdpass.scss, wired in
// angular.json for this config), so there is no separate stylesheet to maintain.
//
// organizerId scopes this subdomain to one organizer (the backend applies the filter). It MUST
// match the OrganizerId stamped on the Manickath events in the DB (see scripts/seed-manickath-gala.sql).
export const environment = {
  production: true,
  apiUrl: 'https://crowdpass.azurewebsites.net',
  organizerId: 'A9C17A00-0000-4000-9000-0000000000AA' as string | null,   // Manickath organizer
  appName: 'Manickath Global',
  identityUrl: '',
  identityAPIUrl: '',
  stripe: {
    // Mirrors environment.crowdpass.ts (CrowdPass supplies the publishable key for this platform).
    testmode: false,
    publishableKey: '',
    testpublishableKey: ''
  },
  theme: {
    id: 'manickath',
    name: 'Manickath Global',
    domain: 'manickath.crowdpass.co.uk',
    company: {
      name: 'Manickath Global',
      logo: { text: 'MANICKATH', sublabel: 'GLOBAL', color: '#FFD60A', backgroundColor: '#0D0D0F' },
      logoImage: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/manickath/Manickath_Logo_Transparent.png',
      favicon: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/manickath/Manickath_Logo_Transparent.png',
      primaryColor: '#0D0D0F',
      secondaryColor: '#FFD60A',
      accentColor: '#F59E0B',
      contact: { phone: '07774 966980', email: '', address: 'Park Hall Resort & Spa, Preston' }
    },
    navigation: {
      menuItems: [
        { label: 'Home', routerLink: '/', type: 'home', external: false },
        { label: 'Events', routerLink: '/events', type: 'events', external: false }
      ],
      showSearch: false,
      showCart: true
    },
    theme: {
      backgroundColor: '#0D0D0F',
      textColor: '#FFFFFF',
      buttonColor: '#FFD60A',
      buttonTextColor: '#0D0D0F',
      glassBackground: 'rgba(255, 255, 255, 0.05)',
      glassBorder: 'rgba(255, 214, 10, 0.22)',
      headerStyle: 'minimal'
    },
    features: { enableAuth: true, enableCart: true, enableSearch: false, showContactInfo: true }
  }
};
