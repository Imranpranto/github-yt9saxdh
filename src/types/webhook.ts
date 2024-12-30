export type WebhookConfig = {
  id?: string;
  name: string;
  url: string;
  description?: string;
  authType: 'none' | 'basic' | 'bearer';
  authValue?: string;
  method: 'GET' | 'POST' | 'PUT';
  headers: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
  createdAt?: string;
  updatedAt?: string;
};

export type WebhookDelivery = {
  id: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error' | 'retrying';
  responseStatus: number;
  responseData?: string;
  message?: string;
};
