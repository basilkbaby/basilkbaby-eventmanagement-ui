export type AppMode = 'main' | 'bespoke';

export interface HeaderConfig {
  company: {
    name: string;
    logo: {
      text: string;
      color: string;
      backgroundColor: string;
      sublabel: string;
    };
    primaryColor:   string;
    secondaryColor: string;
    accentColor:    string;
    contact: {
      phone:   string;
      email:   string;
      address: string;
    };
  };
  navigation: {
    menuItems: Array<{
      label:       string;
      routerLink:  string;
      type:        'home' | 'events' | 'concerts' | 'sports' | 'theater' | 'about' | 'contact' | 'custom';
      external?:   boolean;
    }>;
    showSearch: boolean;
    showCart:   boolean;
  };
  theme: {
    backgroundColor:  string;
    textColor:        string;
    buttonColor:      string;
    buttonTextColor:  string;
    glassBackground?: string;
    glassBorder?:     string;
    headerStyle?:     'full' | 'minimal';
    logoUrl?:         string;
    faviconUrl?:      string;
  };
  features: {
    enableAuth:       boolean;
    enableCart:       boolean;
    enableSearch:     boolean;
    showContactInfo:  boolean;
  };
  seo?: {
    title?:       string;
    description?: string;
    themeColor?:  string;
    ogImage?:     string;
    ogUrl?:       string;
  };
}

export interface CompanyConfig extends HeaderConfig {
  id:     string;
  name:   string;
  domain: string;
  mode:   AppMode;   // ← new: 'main' | 'bespoke'
}