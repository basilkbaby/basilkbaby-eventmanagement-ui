// Default / dev config (also the build-time replacement target). Mirrors the V4 deployment so
// `ng serve` shows V4. Production deployments replace this file via angular.json fileReplacements
// (environment.v4.ts / environment.crowdpass.ts / environment.<organizer>.ts).
export const environment = {
  production: false,
  apiUrl: 'https://v4entertainment.azurewebsites.net',
  organizerId: null as string | null,   // null = show all events; a GUID = one organizer
  appName: 'V4 Entertainment',
  identityUrl: 'http://localhost:55884',
  identityAPIUrl: 'https://localhost:7114',
  stripe: {
    testmode: true,
    publishableKey: 'pk_live_51Sd8PIF1Dtz3Qz6bNcA2zmuFlkxPCYoxN5VG3crZpmv6zSIFddHtW0ybqmJVCUuWjexz9EETvOcJySaeOvwGwYrW00oLkYHolM',
    testpublishableKey: 'pk_live_51Sd8PIF1Dtz3Qz6bNcA2zmuFlkxPCYoxN5VG3crZpmv6zSIFddHtW0ybqmJVCUuWjexz9EETvOcJySaeOvwGwYrW00oLkYHolM'
  },
  theme: {
    id: 'v4entertainments',
    name: 'V4 Entertainments',
    domain: 'v4entertainments.co.uk',
    company: {
      name: 'V4 Entertainments',
      logo: { text: 'V4', sublabel: 'ENTERTAINMENT', color: '#FFFFFF', backgroundColor: '#1a1a2e' },
      logoImage: 'assets/images/logo/logo.webp',
      favicon: 'assets/images/logo/logo.webp',
      primaryColor: '#1a1a2e',
      secondaryColor: '#e94560',
      accentColor: '#f9a826',
      contact: { phone: '+44 7878896384', email: 'events@v4entertainments.co.uk', address: 'E6 1LW, London' }
    },
    navigation: {
      menuItems: [
        { label: 'Home', routerLink: 'https://v4entertainments.co.uk', type: 'home', external: true },
        { label: 'Events', routerLink: '/events', type: 'events', external: false },
        { label: 'About Us', routerLink: 'https://v4entertainments.co.uk/about-us', type: 'about', external: true },
        { label: 'Contact Us', routerLink: 'https://v4entertainments.co.uk/contact-us', type: 'contact', external: true }
      ],
      showSearch: true,
      showCart: true
    },
    theme: {
      backgroundColor: '#1a1a2e',
      textColor: '#FFFFFF',
      buttonColor: '#e94560',
      buttonTextColor: '#FFFFFF',
      glassBackground: 'rgba(255, 255, 255, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.15)',
      headerStyle: 'minimal'
    },
    features: { enableAuth: true, enableCart: true, enableSearch: false, showContactInfo: true }
  }
};
