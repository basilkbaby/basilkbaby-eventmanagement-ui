import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeaderConfig } from '../models/config.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // Seed synchronously from the build-time theme so branding is correct before first render
  // (no runtime fetch of companies.json -> no default-theme flash on slow loads).
  private configSubject = new BehaviorSubject<HeaderConfig | null>(
    environment.theme as unknown as HeaderConfig
  );
  public config$ = this.configSubject.asObservable();

  private currentCompany: string = (environment.theme as any)?.id ?? 'default';

  constructor() {}

  /**
   * Kept async for call-site compatibility, but resolves immediately from the baked-in
   * environment.theme — the deployment (via angular.json fileReplacements) decides the theme,
   * not an app-load fetch.
   */
  async loadConfig(_companyId: string = 'v4entertainments'): Promise<HeaderConfig> {
    const cfg = environment.theme as unknown as HeaderConfig;
    this.configSubject.next(cfg);
    this.currentCompany = (cfg as any)?.id ?? 'default';
    return cfg;
  }

  getConfig(): HeaderConfig | null {
    return this.configSubject.value;
  }
}
