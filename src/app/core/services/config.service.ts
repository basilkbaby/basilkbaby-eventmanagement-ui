import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { CompanyConfig, HeaderConfig } from '../models/config.interface';
import { environment } from '../../../environments/environment';
import { getEventData } from '../../components/event-landing/common/event-data';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<HeaderConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  private currentCompany: string = 'default';

  constructor(
    private http: HttpClient,
    private titleService: Title,
    private metaService: Meta
  ) {}

  async loadConfig(companyId: string = environment.companyId): Promise<HeaderConfig> {
    try {
      const companies = await this.http.get<CompanyConfig[]>('/assets/config/companies.json').toPromise();
      
      if (!companies) {
        throw new Error('No companies configuration found');
      }

      // Try to find company by domain first, then by ID
      const currentDomain = this.getCurrentDomain();
      let companyConfig = companies.find(company => company.domain === currentDomain);
      
      if (!companyConfig) {
        companyConfig = companies.find(company => company.id === companyId);
      }

      if (!companyConfig) {
        companyConfig = companies.find(company => company.id === 'default');
      }

      if (companyConfig) {
        this.configSubject.next(companyConfig);
        this.currentCompany = companyConfig.id;
        this.updateSeoTags(companyConfig);
        return companyConfig;
      } else {
        throw new Error('No suitable configuration found');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw error;
    }
  }

  getConfig(): HeaderConfig | null {
    return this.configSubject.value;
  }

  private updateSeoTags(config: HeaderConfig): void {
    const eventData = getEventData(this.currentCompany);
    const companyName = config.company.name;
    const title = `${companyName} | CrowdPass`;
    const bannerImage = eventData.eventConfig.bannerImages[0] ?? '';
    const logoUrl = config.company.logo.logoUrl ?? '';

    this.titleService.setTitle(title);

    this.metaService.updateTag({ property: 'og:title',     content: title });
    this.metaService.updateTag({ property: 'og:site_name', content: title });
    this.metaService.updateTag({ property: 'og:image',     content: bannerImage });
    this.metaService.updateTag({ name: 'twitter:title',    content: title });
    this.metaService.updateTag({ name: 'twitter:image',    content: bannerImage });
    this.metaService.updateTag({ name: 'twitter:image:alt', content: companyName });

    if (logoUrl) {
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]')
        .forEach(el => el.href = logoUrl);
    }
  }

  private getCurrentDomain(): string {
    return window.location.hostname;
  }
}