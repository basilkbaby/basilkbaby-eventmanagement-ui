export type { Venue, Artist, Sponsor, Contact, Production, EventConfig, EventDataSet } from './event-data.types';

import { environment } from '../../../../environments/environment';
import { manchesterGemsData } from './event-data.manchestergems';
import { v4entertainmentData } from './event-data.v4entertainment';
import { EventDataSet } from './event-data.types';

const EVENT_REGISTRY: Record<string, EventDataSet> = {
  manchestergems: manchesterGemsData,
  v4entertainment: v4entertainmentData,
};

const data: EventDataSet = EVENT_REGISTRY[environment.companyId] ?? manchesterGemsData;

export const VENUE_DATA   = data.venues;
export const ARTIST_DATA  = data.artists;
export const SPONSOR_DATA = data.sponsors;
export const CONTACT_DATA = data.contacts;
export const EVENT_CONFIG = data.config;
