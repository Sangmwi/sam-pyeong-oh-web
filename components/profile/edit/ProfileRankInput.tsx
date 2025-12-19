'use client';

import FormSection from '@/components/ui/FormSection';
import FormSelect from '@/components/ui/FormSelect';
import { Rank } from '@/lib/types';

interface ProfileRankInputProps {
  value: Rank;
  onChange: (value: Rank) => void;
  disabled?: boolean;
}

const RANK_OPTIONS: { value: Rank; label: string }[] = [
  { value: '이병-1호봉', label: '이병 1호봉' },
  { value: '이병-2호봉', label: '이병 2호봉' },
  { value: '이병-3호봉', label: '이병 3호봉' },
  { value: '이병-4호봉', label: '이병 4호봉' },
  { value: '이병-5호봉', label: '이병 5호봉' },
  { value: '이병-6호봉', label: '이병 6호봉' },
  { value: '일병-1호봉', label: '일병 1호봉' },
  { value: '일병-2호봉', label: '일병 2호봉' },
  { value: '일병-3호봉', label: '일병 3호봉' },
  { value: '일병-4호봉', label: '일병 4호봉' },
  { value: '일병-5호봉', label: '일병 5호봉' },
  { value: '일병-6호봉', label: '일병 6호봉' },
  { value: '상병-1호봉', label: '상병 1호봉' },
  { value: '상병-2호봉', label: '상병 2호봉' },
  { value: '상병-3호봉', label: '상병 3호봉' },
  { value: '상병-4호봉', label: '상병 4호봉' },
  { value: '상병-5호봉', label: '상병 5호봉' },
  { value: '상병-6호봉', label: '상병 6호봉' },
  { value: '병장-1호봉', label: '병장 1호봉' },
  { value: '병장-2호봉', label: '병장 2호봉' },
  { value: '병장-3호봉', label: '병장 3호봉' },
  { value: '병장-4호봉', label: '병장 4호봉' },
  { value: '병장-5호봉', label: '병장 5호봉' },
  { value: '병장-6호봉', label: '병장 6호봉' },
];

export default function ProfileRankInput({
  value,
  onChange,
  disabled = false,
}: ProfileRankInputProps) {
  return (
    <FormSection
      title="계급"
      description={disabled ? "복무 정보에서 입력한 계급입니다." : "현재 계급을 선택하세요."}
    >
      <FormSelect
        value={value}
        onChange={(e) => onChange(e.target.value as Rank)}
        options={RANK_OPTIONS}
        disabled={disabled}
      />
    </FormSection>
  );
}
