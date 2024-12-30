-- Create HeyReach API keys table
CREATE TABLE IF NOT EXISTS heyreach_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_heyreach_api_key_name_per_user UNIQUE(user_id, name)
);

-- Create HeyReach sync logs table
CREATE TABLE IF NOT EXISTS heyreach_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES heyreach_api_keys(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  details TEXT,
  list_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_heyreach_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_heyreach_api_keys_updated_at
  BEFORE UPDATE ON heyreach_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_heyreach_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_heyreach_api_keys_user_id ON heyreach_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_heyreach_sync_logs_user_id ON heyreach_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_heyreach_sync_logs_api_key_id ON heyreach_sync_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_heyreach_sync_logs_timestamp ON heyreach_sync_logs(timestamp);