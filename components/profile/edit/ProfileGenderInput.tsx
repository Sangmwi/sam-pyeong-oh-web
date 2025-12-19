'use client';

import FormSection from '@/components/ui/FormSection';
import { Gender } from '@/lib/types';

interface ProfileGenderInputProps {
  value: Gender;
  onChange: (value: Gender) => void;
  disabled?: boolean;
}

export default function ProfileGenderInput({
  value,
  onChange,
  disabled = false,
}: ProfileGenderInputProps) {
  return (
    <FormSection
      title="성별"
      description={disabled ? "본인인증 시 입력한 정보입니다." : "성별을 선택하세요."}
    >
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('male')}
          className={`
            flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              value === 'male'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
            }
          `}
        >
          남성
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('female')}
          className={`
            flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              value === 'female'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
            }
          `}
        >
          여성
        </button>
      </div>
    </FormSection>
  );
}
