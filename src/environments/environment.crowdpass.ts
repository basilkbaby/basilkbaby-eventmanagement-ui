// Build-time config for the CrowdPass deployment.
//   ng build --configuration crowdpass
// CrowdPass is the shared multi-organizer platform. The MAIN site shows all events, so
// organizerId is null here. For a single organizer's subdomain, copy this to
// environment.<organizer>.ts and set organizerId to that organizer's GUID (needs the backend
// organizer filter, which is now in place). Theme is baked in -> no runtime fetch, no flash.
export const environment = {
  production: true,
  apiUrl: 'https://crowdpass.azurewebsites.net',
  organizerId: null as string | null,   // main site = all organizers; set a GUID for a per-organizer subdomain
  appName: 'CrowdPass',
  identityUrl: '',
  identityAPIUrl: '',
  stripe: {
    testmode: false,
    publishableKey: '',
    testpublishableKey: ''
  },
  theme: {
    id: 'crowdpass',
    name: 'CrowdPass',
    domain: 'crowdpass.co.uk',
    company: {
      name: 'CrowdPass',
      logo: { text: 'CrowdPass', sublabel: '', color: '#FFD60A', backgroundColor: '#0D0D0F' },
      // Hosted CrowdPass logo (spaces URL-encoded). Replace favicon with a square icon when ready.
      logoImage: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/crowdpass-base/Crowdpass%20Ticketing%20Logo.png',
      favicon: 'https://eventmanagementimages.blob.core.windows.net/crowdpass/crowdpass-base/Crowdpass%20Ticketing%20Logo.png',
      primaryColor: '#0D0D0F',
      secondaryColor: '#FFD60A',
      accentColor: '#F59E0B',
      contact: { phone: '', email: 'support@crowdpass.co.uk', address: '' }
    },
    navigation: {
      menuItems: [
        { label: 'Home', routerLink: 'https://crowdpass.co.uk', type: 'home', external: true },
        { label: 'Events', routerLink: '/events', type: 'events', external: false },
        { label: 'Contact Us', routerLink: 'https://crowdpass.co.uk/contact', type: 'contact', external: true }
      ],
      showSearch: true,
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
