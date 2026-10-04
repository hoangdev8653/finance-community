'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

export function GoogleAuthButton({ onSuccess, onError }: GoogleAuthButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [scaleX, setScaleX] = useState<number>(1);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Responsive scaling to match form button width perfectly
  useEffect(() => {
    const updateScale = () => {
      const parentWidth = wrapperRef.current?.clientWidth;
      if (parentWidth && parentWidth > 400) {
        setScaleX(parentWidth / 400);
      } else {
        setScaleX(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    let observer: ResizeObserver | null = null;
    if (wrapperRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateScale);
      observer.observe(wrapperRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateScale);
      if (observer) observer.disconnect();
    };
  }, [isRendered]);

  // Initialize and mount Google Sign-in button on load
  useEffect(() => {
    if (!googleClientId || typeof window === 'undefined') return;

    let isMounted = true;

    const setupGoogle = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !containerRef.current) return;

      try {
        if (!(window as any).__googleAuthInitialized) {
          (window as any).__googleAuthInitialized = true;
          google.accounts.id.initialize({
            client_id: googleClientId,
            auto_select: false,
            cancel_on_tap_outside: true,
            callback: async (response: { credential?: string }) => {
              try {
                if (response?.credential) {
                  await loginWithGoogle(response.credential);
                  if (onSuccess) onSuccess();
                }
              } catch (err: any) {
                if (onError) onError(err.message || 'Đăng nhập Google thất bại.');
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
          width: 400,
        });

        if (isMounted) {
          setIsRendered(true);
        }
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
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [googleClientId, loginWithGoogle, onSuccess, onError]);

  const handleFallbackClick = async () => {
    try {
      // In development or when Google script fails/blocked, provide resilient fallback
      if (process.env.NODE_ENV !== 'production') {
        const mockIdToken = 'mock_google_id_token_google_user';
        await loginWithGoogle(mockIdToken);
        if (onSuccess) onSuccess();
        return;
      }
      if (onError) onError('Không thể kết nối đến máy chủ Google. Vui lòng tắt chặn quảng cáo và thử lại.');
    } catch (err: any) {
      if (onError) onError(err.message || 'Đăng nhập Google thất bại.');
    }
  };

  return (
    <div ref={wrapperRef} className="w-full relative flex justify-center items-center min-h-[44px] overflow-hidden rounded-md">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      {/* Official Google GIS Button: Scaled to match 100% full-width of sign-in button */}
      <div
        ref={containerRef}
        id="google-signin-container"
        className={`w-full flex justify-center items-center ${isRendered ? 'flex' : 'hidden'}`}
        style={{
          transform: scaleX > 1 ? `scaleX(${scaleX})` : undefined,
          transformOrigin: 'center center',
        }}
      />

      {/* Visual Custom Button: Shown while Google GIS script is loading or in test/fallback mode */}
      {!isRendered && (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-center gap-3 border-input bg-white font-medium text-foreground hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer pointer-events-auto shadow-2xs"
          onClick={handleFallbackClick}
          disabled={isLoading}
          aria-label="Đăng nhập bằng Google"
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
      )}
    </div>
  );
}
