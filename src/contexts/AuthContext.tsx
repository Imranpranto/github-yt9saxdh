import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { initializeDatabase } from '../utils/database';
import { toast } from '../utils/toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    emailVerified: false
  });

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ 
        ...prev, 
        user: session?.user ?? null, 
        loading: false,
        emailVerified: session?.user?.email_confirmed_at ? true : false
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState(prev => ({ 
        ...prev, 
        user: session?.user ?? null,
        emailVerified: session?.user?.email_confirmed_at ? true : false
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Create auth user
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://app.lienrich.com/auth'
        }
      });
      
      if (error) throw error;
      if (!user) throw new Error('Failed to create account');

      setState(prev => ({ ...prev, emailVerified: false }));
      toast.success('Account created! Please check your email for verification.');

      // Initialize user profile with trial credits
      const { error: profileError } = await supabase
        .from('credits_calculation_and_profiles')
        .insert([{
          id: user.id,
          email: user.email,
          plan: 'Trial',
          total_credits: 250,
          used_credits: 0,
          credits_left: 250,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (profileError) {
        // If error is duplicate key, ignore it as profile might already exist
        if (profileError.code !== '23505') {
          console.error('Error initializing user profile:', profileError);
          throw profileError;
        }
      }

    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        if (error.code === '23505') {
          throw new Error('Email already registered');
        }
        throw error;
      }
      throw new Error('Failed to create account');
    }
  };

  const resendVerificationEmail = async () => {
    if (!state.user?.email) {
      throw new Error('No email address found');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: state.user.email,
      options: {
        emailRedirectTo: 'https://app.lienrich.com/auth'
      }
    });

    if (error) throw error;
    toast.success('Verification email sent! Please check your inbox');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState(prev => ({ ...prev, user: null }));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      signOut,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}