'use client';
import { IconCheck } from '@/components/icons';
import { StepperProps } from '@/types/ui/stepper.types';

export function Stepper({ steps, currentStep, onStepClick, canAccessStep }: StepperProps) {
  const progressWidth = steps.length > 1
    ? `${((currentStep - 1) / (steps.length - 1)) * 80}%`
    : '0%';

  return (
    <div className="bg-card border border-border rounded-(--radius-xl) p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative px-2 md:px-12">
        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-border z-0" />
        <div
          className="hidden md:block absolute top-[28px] left-[10%] h-[2px] bg-primary z-0 transition-all duration-500 ease-in-out"
          style={{ width: progressWidth }}
        />

        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isAccessible = canAccessStep(step.id) || step.id < currentStep;

          return (
            <div
              key={step.id}
              onClick={() => isAccessible && onStepClick(step.id)}
              className={[
                'flex flex-row md:flex-col items-center gap-4 md:gap-3 relative z-10 w-full md:w-auto mb-6 md:mb-0',
                isAccessible ? 'cursor-pointer group' : 'cursor-not-allowed opacity-50',
              ].join(' ')}
            >
              <div
                className={[
                  'w-14 h-14 rounded-(--radius-full) flex items-center justify-center border-[3px] transition-all duration-300 bg-card',
                  isActive
                    ? 'border-primary text-primary shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-110'
                    : isCompleted
                      ? 'border-primary text-primary-fg bg-primary'
                      : 'border-border text-muted group-hover:border-muted',
                ].join(' ')}
              >
                {isCompleted ? <IconCheck size={24} strokeWidth={3} /> : step.icon}
              </div>
              <div className="text-left md:text-center mt-1">
                <h3
                  className={[
                    'text-sm font-bold tracking-wide transition-colors',
                    isActive || isCompleted
                      ? 'text-heading'
                      : 'text-muted group-hover:text-foreground',
                  ].join(' ')}
                >
                  {step.title}
                </h3>
                <p
                  className={[
                    'text-xs mt-0.5',
                    isActive ? 'text-primary' : 'text-muted',
                  ].join(' ')}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
