'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

export function GoogleAuthButton({ onSuccess, onError }: GoogleAuthButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Initialize and mount Google Sign-in iframe overlay on load
  React.useEffect(() => {
    if (!googleClientId || typeof window === 'undefined') return;

    const setupGoogle = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !containerRef.current) return;

      try {
        if (!(window as any).__googleAuthInitialized) {
          (window as any).__googleAuthInitialized = true;
          google.accounts.id.initialize({
            client_id: googleClientId,
            use_fedcm_for_prompt: false,
            auto_select: false,
            callback: async (response: { credential?: string }) => {
              try {
                if (response?.credential) {
                  await loginWithGoogle(response.credential);
                  if (onSuccess) onSuccess();
                }
              } catch (err: any) {
                if (onError) onError(err.message || 'Google authentication failed.');
              }
            },
          });
        }

        containerRef.current.innerHTML = '';
        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 380,
        });
      } catch {
        // Fallback to custom button
      }
    };

    // Check if script already loaded or poll briefly
    if ((window as any).google?.accounts?.id) {
      setupGoogle();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          setupGoogle();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleClientId, loginWithGoogle, onSuccess, onError]);

  const handleCustomClick = async () => {
    try {
      const google = typeof window !== 'undefined' ? (window as any).google : null;
      if (googleClientId && google?.accounts?.id) {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap prompt dismissed
          }
        });
        return;
      }

      // Development fallback mock token
      const mockIdToken = 'mock_google_id_token_google_user';
      await loginWithGoogle(mockIdToken);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (onError) onError(err.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="w-full relative flex justify-center items-center min-h-[44px]">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      {/* Official Google GIS Button Container */}
      <div
        ref={containerRef}
        id="google-signin-container"
        className="w-full flex justify-center [&>iframe]:!w-full [&>iframe]:!max-w-[380px] [&>div]:!w-full [&>div]:!max-w-[380px] z-10"
      />

      {/* Fallback button shown if Google script hasn't rendered yet or in mock dev mode */}
      <div className="w-full absolute inset-0 -z-0 flex items-center justify-center pointer-events-none">
        <Button
          type="button"
          variant="outline"
          className="w-full max-w-[380px] justify-center gap-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 h-11 text-sm shadow-xs cursor-pointer pointer-events-auto"
          onClick={handleCustomClick}
          disabled={isLoading}
          aria-label="Sign in with Google"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Tiếp tục sử dụng dịch vụ bằng Google</span>
        </Button>
      </div>
    </div>
  );
}
