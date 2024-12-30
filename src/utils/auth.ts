import { Session } from '@supabase/supabase-js';

const SESSION_KEY = 'supabase.auth.token';

export function persistSession(session: Session | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type
  }));
}

export function getPersistedSession(): Session | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}