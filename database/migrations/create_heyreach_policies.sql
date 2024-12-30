-- Set up row level security policies
ALTER TABLE heyreach_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE heyreach_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy for API keys table
CREATE POLICY "Users can only view their own API keys"
  ON heyreach_api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own API keys"
  ON heyreach_api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own API keys"
  ON heyreach_api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own API keys"
  ON heyreach_api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for sync logs table
CREATE POLICY "Users can only view their own sync logs"
  ON heyreach_sync_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own sync logs"
  ON heyreach_sync_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON heyreach_api_keys TO authenticated;
GRANT ALL ON heyreach_sync_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;