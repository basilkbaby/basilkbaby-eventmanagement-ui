// Build-time config for the V4 Entertainment deployment.
//   ng build --configuration v4
// V4 is a standalone (bespoke) organizer with its own backend/DB, so organizerId is null
// (its API already returns only V4's events). Theme is baked in -> no runtime fetch, no flash.
export const environment = {
  production: true,
  apiUrl: 'https://v4entertainment.azurewebsites.net',
  organizerId: null as string | null,   // null = show all events this API returns
  appName: 'V4 Entertainment',
  identityUrl: '',
  identityAPIUrl: '',
  stripe: {
    testmode: false,
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
