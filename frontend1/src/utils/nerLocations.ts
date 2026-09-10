export interface NerLocation {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

/**
 * Predefined realistic town/city coordinates spread across all 8 NER states.
 * Used for developer/demo mode to ensure realistic terrain and landslide coverage.
 */
export const NER_LOCATIONS: NerLocation[] = [
  {
    id: 'shillong',
    name: 'Shillong (Police Bazar / Ward\'s Lake)',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.5788,
    longitude: 91.8933,
  },
  {
    id: 'sohra',
    name: 'Sohra (Cherrapunji Plateau)',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.2700,
    longitude: 91.7300,
  },
  {
    id: 'aizawl',
    name: 'Aizawl (Durtlang Ridge / Sector A)',
    district: 'Aizawl',
    state: 'Mizoram',
    latitude: 23.7271,
    longitude: 92.7176,
  },
  {
    id: 'kohima',
    name: 'Kohima (Bara Basti / Naga Heritage)',
    district: 'Kohima',
    state: 'Nagaland',
    latitude: 25.6751,
    longitude: 94.1086,
  },
  {
    id: 'imphal',
    name: 'Imphal (Kangla / Langol Slopes)',
    district: 'Imphal West',
    state: 'Manipur',
    latitude: 24.8170,
    longitude: 93.9368,
  },
  {
    id: 'gangtok',
    name: 'Gangtok (Ridge Park / Deorali)',
    district: 'East Sikkim',
    state: 'Sikkim',
    latitude: 27.3389,
    longitude: 88.6065,
  },
  {
    id: 'itanagar',
    name: 'Itanagar (Ganga Lake / Papum Pare)',
    district: 'Papum Pare',
    state: 'Arunachal Pradesh',
    latitude: 27.0844,
    longitude: 93.6053,
  },
  {
    id: 'agartala',
    name: 'Agartala (Ujjayanta / Banamalipur)',
    district: 'West Tripura',
    state: 'Tripura',
    latitude: 23.8315,
    longitude: 91.2868,
  },
  {
    id: 'guwahati',
    name: 'Guwahati (Kamakhya Foothills / Nilachal)',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    latitude: 26.1445,
    longitude: 91.7362,
  },
];

/**
 * Check if given coordinates lie inside the Northeast Region (NER) bounding polygon.
 * NER rough extent: Lat 21.0 - 30.0, Lon 88.0 - 98.0
 */
export function isWithinNer(lat: number, lon: number): boolean {
  return lat >= 21.0 && lat <= 30.0 && lon >= 88.0 && lon <= 98.0;
}

/**
 * Pick a random realistic NER point from the list.
 */
export function getRandomNerLocation(): NerLocation {
  const randomIndex = Math.floor(Math.random() * NER_LOCATIONS.length);
  return NER_LOCATIONS[randomIndex];
}

/**
 * Get current configured location mode ('real' or 'demo').
 * Defaults to 'demo' in local development.
 */
export function getLocationMode(): 'real' | 'demo' {
  const mode = (import.meta as any).env?.VITE_LOCATION_MODE;
  return mode === 'real' ? 'real' : 'demo';
}
