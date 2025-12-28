
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  teachSkills: string[];
  wantSkills: string[];
  location?: {
    lat: number;
    lng: number;
  };
  matches?: string[]; // IDs of users swiped right
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isAiSuggestion?: boolean;
}

export type ViewState = 'AUTH' | 'ONBOARDING' | 'MAP' | 'DISCOVER' | 'GALLERY' | 'MESSAGES' | 'PROFILE';
