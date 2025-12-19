import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span className="text-sm font-semibold">{stepNumber}</span>}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'w-full bg-primary' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
