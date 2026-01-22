'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'staking-onboarding-completed';

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    const hasSeen = seen === 'true';
    setHasSeenOnboarding(hasSeen);

    // Auto-open if user hasn't seen it
    if (!hasSeen) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasSeenOnboarding(true);
    setIsOnboardingOpen(false);
  }, []);

  const openOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  // Reset for testing (can be called from console)
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSeenOnboarding(false);
  }, []);

  return {
    hasSeenOnboarding,
    isOnboardingOpen,
    openOnboarding,
    closeOnboarding,
    resetOnboarding,
    // Loading state - null means we haven't checked localStorage yet
    isLoading: hasSeenOnboarding === null,
  };
}
