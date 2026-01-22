'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Coins, TrendingUp, Shield, Sparkles } from 'lucide-react';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: <Coins className="w-12 h-12" />,
    title: 'Welcome to Staking',
    description: 'Put your MOVE tokens to work and earn rewards while helping secure the Movement network.',
    highlight: 'Earn passive income on your tokens',
  },
  {
    icon: <TrendingUp className="w-12 h-12" />,
    title: 'Earn Rewards',
    description: 'Stake with validators and earn up to ~4% APY. Rewards are distributed automatically to your account.',
    highlight: 'No minimum stake required',
  },
  {
    icon: <Shield className="w-12 h-12" />,
    title: 'Choose Validators',
    description: 'Select trusted validators based on their performance, commission rates, and total stake.',
    highlight: 'Your tokens remain yours',
  },
  {
    icon: <Sparkles className="w-12 h-12" />,
    title: 'Ready to Start',
    description: 'Browse validators, pick one you trust, and stake your MOVE. You can unstake anytime with a short cooldown.',
    highlight: 'Get started in seconds',
  },
];

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingOverlay({ isOpen, onClose }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to first step when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Content */}
      <div className="relative w-full max-w-sm mx-4">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          Skip
          <X className="w-4 h-4" />
        </button>

        {/* Card */}
        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
            {step.icon}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">{step.description}</p>
            {step.highlight && (
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
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
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-emerald-400'
                    : index < currentStep
                    ? 'bg-emerald-400/50'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                isFirstStep ? 'flex-[2]' : ''
              }`}
            >
              {isLastStep ? "Let's Go" : 'Next'}
              {!isLastStep && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
