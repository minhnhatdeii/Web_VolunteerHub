export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string;  // ISO date string
  location: string;
  category: string;
  maxParticipants: number;
  currentParticipants: number;
  thumbnailUrl?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  submissionNote?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  // Additional fields that might be needed for UI
  date?: string; // Formatted date for display
  time?: string; // Formatted time for display
  organizer?: string; // For display
  requirements?: string[]; // Event requirements
}