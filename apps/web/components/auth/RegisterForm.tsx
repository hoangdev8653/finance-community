'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, RegisterFormData } from '@/lib/auth/auth-schemas';
import { useAuth } from '@/lib/auth/AuthContext';
import { sanitizeRedirectUrl } from '@/lib/auth/redirect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { GoogleAuthButton } from './GoogleAuthButton';
import { Divider } from '@/components/ui/Divider';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const targetRedirect = sanitizeRedirectUrl(redirectParam, '/');

  const { register: registerAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await registerAuth({
        email: data.email,
        username: data.username,
        password: data.password,
      });
      router.push(targetRedirect);
    } catch (err: any) {
      if (err.code === 'EMAIL_ALREADY_EXISTS') {
        setError('email', { message: 'Email address is already registered.' });
      } else if (err.code === 'USERNAME_ALREADY_EXISTS') {
        setError('username', { message: 'Username is already taken.' });
      } else {
        setErrorMessage(
          typeof err.message === 'string'
            ? err.message
            : 'An error occurred during registration. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push(targetRedirect);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Join our financial knowledge community to publish analysis and participate in discussions.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger" title="Registration Failed">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Input
            label="Email address"
            type="email"
            placeholder="analyst@finance.com"
            error={errors.email?.message}
            {...register('email')}
            id="register-email"
            autoComplete="email"
            aria-required="true"
          />
        </div>

        <div>
          <Input
            label="Username"
            type="text"
            placeholder="johndoe_analyst"
            error={errors.username?.message}
            {...register('username')}
            id="register-username"
            autoComplete="username"
            aria-required="true"
          />
        </div>

        <div>
          <Input
            label="Password (min 6 characters)"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
            id="register-password"
            autoComplete="new-password"
            aria-required="true"
          />
        </div>

        <div>
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            id="register-confirm-password"
            autoComplete="new-password"
            aria-required="true"
          />
        </div>

        <Button
          type="submit"
          className="w-full justify-center h-10 font-bold tracking-wide"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Create Account
        </Button>
      </form>

      <div className="relative">
        <Divider />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-surface px-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setErrorMessage} />

      <div className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
        Already have an account?{' '}
        <Link
          href={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
          className="font-semibold text-primary hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
