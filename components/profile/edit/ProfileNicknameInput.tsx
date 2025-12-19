'use client';

import FormSection from '@/components/ui/FormSection';
import FormInput from '@/components/ui/FormInput';

interface ProfileNicknameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function ProfileNicknameInput({
  value,
  onChange,
  error,
}: ProfileNicknameInputProps) {
  return (
    <FormSection
      title="닉네임"
      description="다른 사용자에게 표시될 닉네임을 설정하세요."
    >
      <FormInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="닉네임을 입력하세요"
        error={error}
        maxLength={20}
      />
    </FormSection>
  );
}
