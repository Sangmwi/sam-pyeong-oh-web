'use client';

import FormSection from '@/components/ui/FormSection';
import FormInput from '@/components/ui/FormInput';

interface ProfileHeightWeightInputProps {
  height: string;
  weight: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
}

export default function ProfileHeightWeightInput({
  height,
  weight,
  onHeightChange,
  onWeightChange,
}: ProfileHeightWeightInputProps) {
  return (
    <FormSection
      title="신체 정보"
      description="신장과 체중 정보를 입력하세요."
    >
      <div className="space-y-3">
        <FormInput
          type="number"
          step="0.1"
          label="신장 (cm)"
          value={height}
          onChange={(e) => onHeightChange(e.target.value)}
          placeholder="예: 175"
        />
        <FormInput
          type="number"
          step="0.1"
          label="체중 (kg)"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          placeholder="예: 70"
        />
      </div>
    </FormSection>
  );
}
