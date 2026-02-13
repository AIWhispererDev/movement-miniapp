export interface AppMetadata {
  app_id?: number; // Numeric app ID from contract (added for new contract)
  name: string;
  description: string;
  icon: string;
  url: string;
  slug: string; // URL-friendly identifier (e.g., "bridge-assets")
  developer_address: string;
  developer_name: string;
  category: string;
  language: string; // ISO 639-1 code (e.g., "en", "es", "zh") or "all" for universal apps
  status: number;
  submitted_at: number;
  updated_at: number;
  approved_at: number;
  downloads: number;
  rating: number;
  permissions: string[];
  verified: boolean;
}

export interface PendingChange {
  new_metadata: AppMetadata;
  requested_at: number;
  change_type: number;
}

export enum AppStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export const APP_STATUS_LABELS: Record<AppStatus, string> = {
  [AppStatus.PENDING]: 'Pending',
  [AppStatus.APPROVED]: 'Approved',
  [AppStatus.REJECTED]: 'Rejected',
};

export const APP_STATUS_COLORS: Record<AppStatus, string> = {
  [AppStatus.PENDING]: '#f59e0b',
  [AppStatus.APPROVED]: '#10b981',
  [AppStatus.REJECTED]: '#ef4444',
};

export const CATEGORY_LABELS: Record<string, string> = {
  // New categories
  games: 'Games',
  earn: 'Earn',
  social: 'Social',
  collect: 'Collect',
  swap: 'Swap',
  utility: 'Utility',
  other: 'Other',
  // Legacy mappings (for old apps)
  game: 'Games',
  defi: 'Earn',
  nft: 'Collect',
};

export const LANGUAGE_LABELS: Record<string, string> = {
  all: 'All Languages',
  af: 'Afrikaans',
  am: 'Amharic',
  ar: 'Arabic',
  az: 'Azerbaijani',
  be: 'Belarusian',
  bg: 'Bulgarian',
  bn: 'Bengali',
  bs: 'Bosnian',
  ca: 'Catalan',
  cs: 'Czech',
  cy: 'Welsh',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  es: 'Spanish',
  et: 'Estonian',
  eu: 'Basque',
  fa: 'Persian',
  fi: 'Finnish',
  fil: 'Filipino',
  fr: 'French',
  ga: 'Irish',
  gl: 'Galician',
  gu: 'Gujarati',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  hu: 'Hungarian',
  hy: 'Armenian',
  id: 'Indonesian',
  is: 'Icelandic',
  it: 'Italian',
  ja: 'Japanese',
  ka: 'Georgian',
  kk: 'Kazakh',
  km: 'Khmer',
  kn: 'Kannada',
  ko: 'Korean',
  ky: 'Kyrgyz',
  lo: 'Lao',
  lt: 'Lithuanian',
  lv: 'Latvian',
  mk: 'Macedonian',
  ml: 'Malayalam',
  mn: 'Mongolian',
  mr: 'Marathi',
  ms: 'Malay',
  my: 'Burmese',
  ne: 'Nepali',
  nl: 'Dutch',
  no: 'Norwegian',
  pa: 'Punjabi',
  pl: 'Polish',
  ps: 'Pashto',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  sq: 'Albanian',
  sr: 'Serbian',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  zh: 'Chinese',
  zu: 'Zulu',
};

export const PERMISSION_LABELS: Record<string, string> = {
  wallet_read: 'Read Wallet',
  sign_transaction: 'Sign Transactions',
  sign_message: 'Sign Messages',
  storage_read: 'Read Storage',
  storage_write: 'Write Storage',
  camera: 'Camera Access',
  location: 'Location Access',
};
