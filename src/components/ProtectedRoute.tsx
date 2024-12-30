import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import EmailVerificationBanner from './EmailVerificationBanner';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, emailVerified } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {user && !emailVerified && <EmailVerificationBanner />}
      {children}
    </>
  );
}