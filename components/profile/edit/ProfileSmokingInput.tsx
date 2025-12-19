'use client';

import FormSection from '@/components/ui/FormSection';

interface ProfileSmokingInputProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export default function ProfileSmokingInput({
  value,
  onChange,
}: ProfileSmokingInputProps) {
  return (
    <FormSection
      title="흡연 여부"
      description="운동 파트너 매칭에 활용됩니다."
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`
            flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all
            ${
              value === false
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
            }
          `}
        >
          비흡연
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`
            flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all
            ${
              value === true
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
            }
          `}
        >
          흡연
        </button>
      </div>
    </FormSection>
  );
}
