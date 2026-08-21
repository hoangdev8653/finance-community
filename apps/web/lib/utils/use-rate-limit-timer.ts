'use client';

import { useState, useEffect, useCallback } from 'react';

export function useRateLimitTimer() {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const startCountdown = useCallback((seconds: number) => {
    setSecondsRemaining(Math.max(1, Math.ceil(seconds)));
  }, []);

  const handleApiError = useCallback(
    (err: any): boolean => {
      const is429 =
        err?.status === 429 ||
        err?.response?.status === 429 ||
        err?.response?.data?.code === 'RATE_LIMIT_EXCEEDED';

      if (is429) {
        const retryAfter =
          err?.response?.data?.retryAfterSeconds ||
          Number(err?.response?.headers?.['retry-after']) ||
          30;
        startCountdown(retryAfter);
        return true;
      }
      return false;
    },
    [startCountdown]
  );

  return {
    secondsRemaining,
    isRateLimited: secondsRemaining > 0,
    startCountdown,
    handleApiError,
    resetCountdown: () => setSecondsRemaining(0),
  };
}
