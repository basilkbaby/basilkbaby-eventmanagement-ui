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
      logo: { text: 'MANICKATH', sublabel: 'GLOBAL', color: '#E0C88C', backgroundColor: '#0D1320' },
      logoImage: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/manickath/Manickath_Logo_Transparent.png',
      favicon: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/events/manickath/Manickath_Logo_Transparent.png',
      primaryColor: '#0D1320',
      secondaryColor: '#D9BD83',
      accentColor: '#E6D2A8',
      contact: { phone: '07774 966980', email: '', address: 'Park Hall Resort & Spa, Preston' }
    },
    navigation: {
      menuItems: [
        { label: 'Home', routerLink: '/', type: 'home', external: false },
        { label: 'Events', routerLink: '/events', type: 'events', external: false },
        // External pages hosted on the main Manickath site (open in a new tab).
        { label: 'Contact', routerLink: 'https://www.manickath.com/contact.html', type: 'custom', external: true },
        { label: 'Privacy', routerLink: 'https://www.manickath.com/privacy.html', type: 'custom', external: true },
        { label: 'Terms', routerLink: 'https://www.manickath.com/terms.html', type: 'custom', external: true }
      ],
      showSearch: false,
      showCart: true
    },
    theme: {
      backgroundColor: '#0D1320',
      textColor: '#F2F1EA',
      buttonColor: '#D9BD83',
      buttonTextColor: '#10192A',
      glassBackground: 'rgba(255, 255, 255, 0.05)',
      glassBorder: 'rgba(230, 210, 168, 0.22)',
      headerStyle: 'minimal'
    },
    features: { enableAuth: true, enableCart: true, enableSearch: false, showContactInfo: true }
  }
};
