'use client';

import { useState, useEffect } from 'react';

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
  highlight?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: '💸',
    title: 'Send Tokens Instantly',
    description: 'Transfer MOVE, USDC, USDT, and other tokens to any address on the Movement network.',
    highlight: 'Fast & low fees',
  },
  {
    icon: '✨',
    title: 'Simple & Secure',
    description: 'Select a token, enter the recipient address (or scan QR), set the amount, and send. Transactions are confirmed in seconds.',
    highlight: 'Ready to send',
  },
];

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme: {
    bg: { primary: string; secondary: string };
    text: { primary: string; secondary: string };
    border: { default: string };
    accent: { primary: string; hover: string };
  };
}

export function OnboardingOverlay({ isOpen, onClose, theme }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Content */}
      <div className="relative w-full max-w-sm mx-4">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-sm flex items-center gap-1 transition-colors"
          style={{ color: theme.text.secondary }}
        >
          Skip
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Card */}
        <div className="rounded-3xl p-8 border" style={{ backgroundColor: theme.bg.secondary, borderColor: theme.border.default }}>
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl"
            style={{ backgroundColor: `${theme.accent.primary}20` }}
          >
            {step.icon}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3" style={{ color: theme.text.primary }}>{step.title}</h2>
            <p className="mb-4 leading-relaxed" style={{ color: theme.text.secondary }}>{step.description}</p>
            {step.highlight && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${theme.accent.primary}15`, color: theme.accent.primary }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {step.highlight}
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: index === currentStep ? '24px' : '8px',
                  backgroundColor: index === currentStep
                    ? theme.accent.primary
                    : index < currentStep
                      ? `${theme.accent.primary}80`
                      : theme.border.default
                }}
              />
            ))}
          </div>

          {/* Navigation */}
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.accent.primary, color: '#000000' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accent.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.accent.primary}
          >
            {isLastStep ? "Let's Send" : 'Next'}
            {!isLastStep && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
