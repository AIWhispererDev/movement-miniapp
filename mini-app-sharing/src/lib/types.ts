export interface AppMetadata {
  name: string;
  description: string;
  icon: string;
  url: string;
  slug?: string; // The app slug/ID used in URLs
  developer_address: string;
  developer_name: string;
  category: string;
  status: number;
  submitted_at: number;
  updated_at: number;
  approved_at: number;
  downloads: number;
  rating: number;
  permissions: string[];
  verified: boolean;
}

