import { Injectable, signal, computed } from '@angular/core';
import { CompanyConfig, HeaderConfig } from '../models/config.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private _config = signal<CompanyConfig | null>(null);

  readonly config$    = this._config.asReadonly();
  readonly theme      = computed(() => this._config()?.theme);
  readonly navigation = computed(() => this._config()?.navigation);
  readonly company    = computed(() => this._config()?.company);
  readonly features   = computed(() => this._config()?.features);
  readonly isBespoke  = computed(() => this._config()?.mode !== 'main');
  readonly isMain     = computed(() => this._config()?.mode === 'main');

  // ── Called by APP_INITIALIZER ───────────────────────────────────────────────
  async loadConfig(): Promise<void> {
    const companyId = environment.companyId || 'default';

    try {
      const res = await fetch('/assets/config/companies.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const companies: CompanyConfig[] = await res.json();
      if (!companies?.length) throw new Error('Empty companies.json');

      const config =
        companies.find(c => c.id === companyId) ??
        companies.find(c => c.domain === window.location.hostname) ??
        companies.find(c => c.id === 'default');

      if (!config) throw new Error(`No config found for: ${companyId}`);

      this._config.set(config);
      this.applyMeta(config);

    } catch (err) {
      console.error('[ConfigService] Failed to load config:', err);
      // Set a minimal fallback so the app renders rather than hanging
      this._config.set({
        id: 'default', name: 'CrowdPass', domain: 'localhost', mode: 'bespoke',
        company: { name: 'CrowdPass', logo: { text: 'CP', sublabel: '', color: '#fff', backgroundColor: '#0f172a' }, primaryColor: '#22C55E', secondaryColor: '#16A34A', accentColor: '#f9a826', contact: { phone: '', email: '', address: '' } },
        navigation: { menuItems: [], showSearch: false, showCart: true },
        theme: { backgroundColor: '#0f172a', textColor: '#ffffff', buttonColor: '#22C55E', buttonTextColor: '#ffffff', headerStyle: 'full' },
        features: { enableAuth: false, enableCart: true, enableSearch: false, showContactInfo: false },
        seo: { title: 'CrowdPass', description: '' }
      } as CompanyConfig);
    }
  }

  getConfig(): CompanyConfig | null { return this._config(); }

  // ── Apply meta + theme to document ─────────────────────────────────────────
  private applyMeta(config: CompanyConfig): void {
    const root = document.documentElement;

    // CSS variables for use in SCSS
    root.style.setProperty('--color-primary',    config.company.primaryColor);
    root.style.setProperty('--color-secondary',  config.company.secondaryColor);
    root.style.setProperty('--color-accent',     config.company.accentColor);
    root.style.setProperty('--header-bg',        config.theme.backgroundColor);
    root.style.setProperty('--header-text',      config.theme.textColor);
    root.style.setProperty('--btn-color',        config.theme.buttonColor);
    root.style.setProperty('--btn-text',         config.theme.buttonTextColor);

    if (config.theme.glassBackground)
      root.style.setProperty('--glass-bg',     config.theme.glassBackground);
    if (config.theme.glassBorder)
      root.style.setProperty('--glass-border', config.theme.glassBorder);

    // Document title
    document.title = config.seo?.title ?? config.name;

    // Meta tags
    this.setMeta('name',     'description',    config.seo?.description);
    this.setMeta('name',     'theme-color',    config.seo?.themeColor ?? config.theme.backgroundColor);
    this.setMeta('property', 'og:title',       config.seo?.title ?? config.name);
    this.setMeta('property', 'og:description', config.seo?.description);
    this.setMeta('property', 'og:image',       config.seo?.ogImage);
    this.setMeta('property', 'og:url',         config.seo?.ogUrl);

    // Favicon
    if (config.theme.faviconUrl)
      this.setLink('shortcut icon', config.theme.faviconUrl);
  }

  private setMeta(attr: 'name' | 'property', key: string, value?: string): void {
    if (!value) return;
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  private setLink(rel: string, href: string): void {
    let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }
}