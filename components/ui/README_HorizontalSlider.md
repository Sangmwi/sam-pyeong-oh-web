# HorizontalSlider 컴포넌트

가로 스크롤을 지원하는 범용 슬라이더 컴포넌트입니다.

## 주요 기능

✅ **마우스 드래그 스크롤**: 데스크톱에서 마우스로 드래그하여 스크롤
✅ **터치 스크롤**: 모바일에서 터치 제스처 지원
✅ **클릭/드래그 구분**: 드래그 중에는 클릭 이벤트 자동 무시
✅ **커서 변경**: `grab` ↔ `grabbing` 자동 전환
✅ **재사용 가능**: 어떤 컴포넌트든 children으로 전달 가능

## 기본 사용법

```tsx
import HorizontalSlider from '@/components/ui/HorizontalSlider';
import MyCard from './MyCard';

function MySlider({ items }) {
  return (
    <HorizontalSlider gap="gap-4" enableDrag>
      {items.map((item) => (
        <MyCard key={item.id} {...item} onClick={() => handleClick(item.id)} />
      ))}
    </HorizontalSlider>
  );
}
```

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | `ReactNode` | **필수** | 슬라이더에 표시할 컴포넌트들 |
| `gap` | `string` | `'gap-4'` | Tailwind gap 클래스 (예: `'gap-6'`) |
| `className` | `string` | `''` | 추가 CSS 클래스 |
| `enableDrag` | `boolean` | `true` | 드래그 활성화 여부 |
| `scrollSpeed` | `number` | `2` | 스크롤 속도 배율 |

## 실제 사용 예제

### 1. InfluencerSlider

```tsx
import HorizontalSlider from '@/components/ui/HorizontalSlider';
import InfluencerCard from './InfluencerCard';

export default function InfluencerSlider({ influencers, onCardClick }) {
  return (
    <HorizontalSlider gap="gap-4">
      {influencers.map((influencer) => (
        <InfluencerCard
          key={influencer.id}
          {...influencer}
          onClick={() => onCardClick(influencer.id)}
        />
      ))}
    </HorizontalSlider>
  );
}
```

### 2. 더보기 버튼 포함

```tsx
<HorizontalSlider gap="gap-4">
  {items.map((item) => (
    <HorizontalSlider.Item key={item.id}>
      <Card {...item} />
    </HorizontalSlider.Item>
  ))}
  {hasMore && (
    <HorizontalSlider.More>
      <button onClick={onMoreClick} className="text-sm text-primary/70 hover:text-primary transition-colors">
        더보기 →
      </button>
    </HorizontalSlider.More>
  )}
</HorizontalSlider>
```

### 3. 커스텀 gap & 속도

```tsx
<HorizontalSlider
  gap="gap-6"
  scrollSpeed={3}
  className="py-4"
>
  {products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ))}
</HorizontalSlider>
```

### 4. 드래그 비활성화 (터치 스크롤만)

```tsx
<HorizontalSlider gap="gap-4" enableDrag={false}>
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</HorizontalSlider>
```

## 작동 원리

### 드래그 감지
- 5px 이상 움직이면 드래그로 간주
- 드래그 중에는 내부 클릭 이벤트 자동 차단
- 일반 클릭은 정상 작동

### 커서 변경
```
일반 상태:  cursor: grab   (👋)
드래그 중:  cursor: grabbing (✊)
```

### 스크롤 속도
- `scrollSpeed` prop으로 조절 가능
- 기본값 `2` = 마우스 이동 거리의 2배로 스크롤
- 높을수록 빠르게 스크롤

## 스타일링

### 기본 스타일
```tsx
// 컨테이너에 자동 적용되는 스타일
className="flex overflow-x-auto scrollbar-hide pb-2 select-none"
```

### 추가 스타일
```tsx
<InfiniteSlider
  gap="gap-6"
  className="bg-muted/50 rounded-xl p-4"
>
  {/* ... */}
</InfiniteSlider>
```

## 모바일 최적화

- iOS: `WebkitOverflowScrolling: 'touch'` 적용 (부드러운 스크롤)
- Android: 네이티브 터치 스크롤 지원
- 스크롤바 자동 숨김 (모든 브라우저)

## 주의사항

### 1. 카드 너비 고정 필요
슬라이더 내부 카드는 `flex-shrink-0`과 고정 너비를 가져야 합니다:

```tsx
// ✅ 올바른 카드 구조
<div className="flex-shrink-0 w-64">
  {/* 카드 내용 */}
</div>

// ❌ 잘못된 카드 구조 (너비 없음)
<div>
  {/* 카드 내용 */}
</div>
```

### 2. 클릭 이벤트
드래그 중 클릭을 방지하기 위해 이벤트 캡처를 사용합니다.
카드 내부 버튼은 `onClick`이 정상 작동합니다.

### 3. 성능
- 수백 개의 아이템도 부드럽게 작동
- 가상화가 필요한 경우 `react-window` 사용 권장

## 비교: HorizontalSlider vs 일반 div

### HorizontalSlider 사용 시
```tsx
<HorizontalSlider gap="gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</HorizontalSlider>
```

**장점:**
- 마우스 드래그 자동 지원 ✅
- 터치 스크롤 최적화 ✅
- 클릭/드래그 자동 구분 ✅
- 커서 자동 변경 ✅

### 일반 div 사용 시
```tsx
<div className="flex gap-4 overflow-x-auto">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

**단점:**
- 마우스 드래그 불가 ❌
- 스크롤바 표시됨 (모바일에서 보기 안 좋음) ❌
- 드래그 중 클릭 발생 가능 ❌

## 라이선스

MIT
