export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  apiKey: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  isValid?: boolean;
  lastValidated?: string;
}

export interface LeadsList {
  id: number;
  name: string;
  totalItemsCount: number;
  listType: string | null;
  creationTime: string;
  campaignIds: number[];
  status?: string;
  progressStats?: {
    totalUsers: number;
    totalUsersInProgress: number;
    totalUsersPending: number;
    totalUsersFinished: number;
    totalUsersFailed: number;
    totalUsersManuallyStopped: number;
  };
}

export class HeyReachError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'HeyReachError';
  }
}