import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CompanyConfig, HeaderConfig } from '../models/config.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<HeaderConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  private currentCompany: string = 'default';

  constructor(private http: HttpClient) {}

  async loadConfig(companyId: string = 'v4entertainments'): Promise<HeaderConfig> {
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

  private getCurrentDomain(): string {
    return window.location.hostname;
  }
}