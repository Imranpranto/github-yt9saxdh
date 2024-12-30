import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, Loader2 } from 'lucide-react';
import FloatingLabelInput from './FloatingLabelInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { toast } from '../../utils/toast';

export default function SignUpForm() { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Get started with 250 free credits
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingLabelInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          error={error}
          autoComplete="email"
        />

        <div className="space-y-4">
          <FloatingLabelInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <FloatingLabelInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            I agree to the{' '}
            <a href="/terms" className="text-indigo-600 hover:text-indigo-700">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-indigo-600 hover:text-indigo-700">
              Privacy Policy
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !acceptTerms}
          className="relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <span>Create Account</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
