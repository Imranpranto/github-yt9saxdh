export interface Database {
  public: {
    Tables: {
      credits_calculation_and_profiles: {
        Row: {
          id: string;
          plan: string;
          total_credits: number;
          used_credits: number;
          credits_left: number;
          subscription_start_at: string | null;
          subscription_end_at: string | null;
          trial_ends_at: string | null;
        };
        Insert: never; // View is not insertable
        Update: never; // View is not updatable
      };
      audiences: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      leads: {
        Row: {
          id: string;
          user_id: string;
          audience_id: string;
          full_name: string;
          profile_url: string;
          headline: string | null;
          source_operation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          audience_id: string;
          full_name: string;
          profile_url: string;
          headline?: string | null;
          source_operation: string;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          profile_url?: string;
          headline?: string | null;
          source_operation?: string;
        };
      };
      webhooks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          description: string | null;
          auth_type: 'none' | 'basic' | 'bearer';
          auth_value: string | null;
          method: 'GET' | 'POST' | 'PUT';
          headers: Record<string, string>;
          retry_attempts: number;
          retry_delay: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          url: string;
          description?: string | null;
          auth_type?: 'none' | 'basic' | 'bearer';
          auth_value?: string | null;
          method?: 'GET' | 'POST' | 'PUT';
          headers?: Record<string, string>;
          retry_attempts?: number;
          retry_delay?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          url?: string;
          description?: string | null;
          auth_type?: 'none' | 'basic' | 'bearer';
          auth_value?: string | null;
          method?: 'GET' | 'POST' | 'PUT';
          headers?: Record<string, string>;
          retry_attempts?: number;
          retry_delay?: number;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          operation_type: string;
          operation_details: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          operation_type: string;
          operation_details?: Record<string, unknown>;
          created_at?: string;
        };
      };
      heyreach_api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          api_key: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          api_key: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          api_key?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      heyreach_sync_logs: {
        Row: {
          id: string;
          user_id: string;
          api_key_id: string;
          status: 'success' | 'error';
          details: string | null;
          list_id: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          api_key_id: string;
          status: 'success' | 'error';
          details?: string | null;
          list_id?: string | null;
          timestamp?: string;
        };
        Update: {
          status?: 'success' | 'error';
          details?: string | null;
          list_id?: string | null;
          timestamp?: string;
        };
      };
    };
    Functions: {
      deduct_credits: {
        Args: {
          user_id: string;
          amount: number;
          operation: string;
          details: Record<string, unknown>;
        };
        Returns: boolean;
      };
    };
  };
}
