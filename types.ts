
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  points: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface VaccinationScheduleItem {
  ageGroup: string;
  vaccines: string[];
  dueDate: string;
  notes: string;
}

export interface HealthResource {
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
}

export interface DiseaseInfo {
  name: string;
  description: string;
  symptoms: string[];
  prevention: string[];
  treatment: string[];
}

export interface Feedback {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: Date;
}
