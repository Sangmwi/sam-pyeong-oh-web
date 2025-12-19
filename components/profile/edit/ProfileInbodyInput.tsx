'use client';

import FormSection from '@/components/ui/FormSection';
import FormInput from '@/components/ui/FormInput';
import FormToggle from '@/components/ui/FormToggle';

interface ProfileInbodyInputProps {
  muscleMass: string;
  bodyFatPercentage: string;
  showInbodyPublic: boolean;
  onMuscleMassChange: (value: string) => void;
  onBodyFatPercentageChange: (value: string) => void;
  onShowInbodyPublicChange: (value: boolean) => void;
}

export default function ProfileInbodyInput({
  muscleMass,
  bodyFatPercentage,
  showInbodyPublic,
  onMuscleMassChange,
  onBodyFatPercentageChange,
  onShowInbodyPublicChange,
}: ProfileInbodyInputProps) {
  return (
    <FormSection
      title="인바디 정보"
      description="인바디 정보를 입력하면 더 정확한 운동 파트너 매칭을 받을 수 있어요!"
    >
      <div className="space-y-3">
        <FormInput
          type="number"
          step="0.1"
          label="골격근량 (kg)"
          value={muscleMass}
          onChange={(e) => onMuscleMassChange(e.target.value)}
          placeholder="예: 35.2"
        />
        <FormInput
          type="number"
          step="0.1"
          label="체지방률 (%)"
          value={bodyFatPercentage}
          onChange={(e) => onBodyFatPercentageChange(e.target.value)}
          placeholder="예: 15.5"
        />
        <div className="pt-2">
          <FormToggle
            label="인바디 정보 공개"
            description="다른 사용자에게 인바디 정보를 공개합니다"
            checked={showInbodyPublic}
            onChange={onShowInbodyPublicChange}
          />
        </div>
      </div>
    </FormSection>
  );
}
