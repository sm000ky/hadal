export type OceanZone = 
  | 'EPIPELAGIC'     // 0 - 200m (Sunlight Zone)
  | 'MESOPELAGIC'    // 200 - 1,000m (Twilight Zone)
  | 'BATHYPELAGIC'   // 1,000 - 4,000m (Midnight Zone)
  | 'ABYSSOPELAGIC'  // 4,000 - 6,000m (The Abyss)
  | 'HADALPELAGIC';  // 6,000 - 10,994m (The Hadal Trenches)

export type LanguageCode = 'en' | 'id' | 'ja';

export interface NarrativeCue {
  id: number;
  start: number;       // seconds
  end: number;         // seconds
  depthMeters: number; // target depth at this cue
  pressureAtm: number; // hydrostatic pressure
  tempC: number;       // water temperature
  zone: OceanZone;
  en: string;
  id_id: string;
  ja: string;
}

export interface ArchivePlate {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  depth: string;
  expedition: string;
  description: string;
  description_id: string;
  specs: { label: string; value: string }[];
  tags: string[];
}
