export interface HeaderConfig {
  company: {
    name: string;
    logo: {
      text: string;
      color: string;
      backgroundColor: string;
      sublabel: string;
    };
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    contact: {
      phone: string;
      email: string;
      address: string;
    }
  };
  navigation: {
    menuItems: Array<{
      label: string;
      routerLink: string;
      type: 'events' | 'concerts' | 'sports' | 'theater' | 'custom';
      external?: boolean;
    }>;
    showSearch: boolean;
    showCart: boolean;
  };
  theme: {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    glassBackground?: string;
    glassBorder?: string;
  };
  features: {
    enableAuth: boolean;
    enableCart: boolean;
    enableSearch: boolean;
    showContactInfo: boolean; // Add this property
  };
}

export interface CompanyConfig extends HeaderConfig {
  id: string;
  name: string;
  domain: string;
}