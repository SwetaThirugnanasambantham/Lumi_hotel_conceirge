
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingUrls?: Array<{ uri: string; title: string }>;
}

export interface UserProfile {
  name: string;
  interest: 'Culinary' | 'Business' | 'Relaxation' | 'Exploration';
  stayDays: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}
