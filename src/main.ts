import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Apply branding from the build-time theme BEFORE Angular bootstraps, so the title, favicon and
// brand colours are correct from the first paint (the per-config index.html also bakes these in;
// this is a synchronous backstop — no network fetch, so no default-theme flash).
(() => {
  const theme: any = (environment as any).theme;
  const c = theme?.company;
  if (!c) return;
  try {
    if (c.name) document.title = c.name;
    const root = document.documentElement;
    if (c.primaryColor)   root.style.setProperty('--brand-primary', c.primaryColor);
    if (c.secondaryColor) root.style.setProperty('--brand-secondary', c.secondaryColor);
    if (c.accentColor)    root.style.setProperty('--brand-accent', c.accentColor);
    if (c.favicon) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = c.favicon;
    }
  } catch { /* ignore branding errors */ }
})();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
