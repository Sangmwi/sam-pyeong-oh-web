# 디자인 시스템 가이드

## 개요

이 프로젝트는 다크모드를 지원하는 일관된 디자인 시스템을 사용합니다. 모든 색상은 **시맨틱 토큰**을 통해 관리되며, 하드코딩된 색상 값은 사용하지 않습니다.

## 색상 시스템

### 라이트 모드
- **배경**: 연한 회색-녹색 톤 (`#f8faf8`)
- **카드**: 순수 흰색 (`#ffffff`)
- **텍스트**: 진한 녹색 (`#0a2610`)
- **브랜드 컬러**: 그린 (`#50A76C`)

### 다크 모드 (색상 반전 전략)
- **배경**: 가장 어두운 slate (`#0f172a` - slate-900)
- **카드**: 배경보다 밝은 어두운 slate (`#1e293b` - slate-800) ✅
- **텍스트**: 밝은 slate (`#f1f5f9` - slate-100) ✅
- **브랜드 컬러**: 밝은 그린 (`#5fc07f` - green-400) ✅

**핵심 원칙:**
- 라이트 모드에서 "어두운" 요소 → 다크 모드에서 "밝은" 요소
- 라이트 모드에서 "밝은" 요소 → 다크 모드에서 "어두운" 요소
- 카드는 배경과 대비되지만 여전히 어두운 톤 유지

## 시맨틱 토큰

### 레이아웃

| 토큰 | 용도 | 라이트 모드 | 다크 모드 |
|------|------|------------|-----------|
| `bg-background` | 페이지 배경 | `#f8faf8` (밝음) | `#0f172a` (어두움) ⚡ |
| `bg-card` | 카드 배경 | `#ffffff` (가장 밝음) | `#1e293b` (약간 밝은 어두움) ⚡ |
| `text-foreground` | 기본 텍스트 | `#0a2610` (어두움) | `#f1f5f9` (밝음) ⚡ |
| `text-card-foreground` | 카드 내 텍스트 | `#0a2610` (어두움) | `#f1f5f9` (밝음) ⚡ |

### 브랜드 컬러

| 토큰 | 용도 | 라이트 모드 | 다크 모드 |
|------|------|------------|-----------|
| `bg-primary` | 주요 액션 | `#50A76C` (green-500) | `#5fc07f` (green-400 - 더 밝음) ⚡ |
| `text-primary` | 주요 텍스트 | `#50A76C` | `#5fc07f` ⚡ |
| `bg-primary-foreground` | Primary 위 텍스트 | `#ffffff` (밝음) | `#0a2610` (어두움) ⚡ |

### 보조 컬러

| 토큰 | 용도 | 라이트 모드 | 다크 모드 |
|------|------|------------|-----------|
| `bg-secondary` | 보조 버튼 | `#dbf5e2` (밝음) | `#1e293b` (어두움) ⚡ |
| `text-secondary-foreground` | Secondary 위 텍스트 | `#17451c` (어두움) | `#e2e8f0` (밝음) ⚡ |

### 상태 컬러

| 토큰 | 용도 | 라이트 모드 | 다크 모드 |
|------|------|------------|-----------|
| `bg-muted` | 비활성 영역 | `#e8f4eb` (밝음) | `#1e293b` (어두움) ⚡ |
| `text-muted-foreground` | 보조 텍스트 | `#328a4d` (중간) | `#94a3b8` (중간) |
| `border-border` | 테두리 | `#b9eac8` (밝음) | `#334155` (어두움) ⚡ |
| `bg-input` | 입력 필드 배경 | `#dbf5e2` (밝음) | `#1e293b` (어두움) ⚡ |

**⚡ = 색상 밝기 반전 적용**

## 컴포넌트별 가이드

### ❌ 잘못된 사용 (하드코딩)

```tsx
// ❌ 다크모드에서 작동하지 않음
<div className="bg-white text-gray-900">
  <p className="text-green-500">Hello</p>
</div>
```

### ✅ 올바른 사용 (시맨틱 토큰)

```tsx
// ✅ 다크모드 자동 대응
<div className="bg-card text-card-foreground">
  <p className="text-primary">Hello</p>
</div>
```

## 주요 컴포넌트 스타일

### Button

```tsx
// Primary
<Button variant="primary">액션</Button>
// → bg-primary text-primary-foreground

// Secondary
<Button variant="secondary">보조</Button>
// → bg-secondary text-secondary-foreground

// Outline
<Button variant="outline">외곽선</Button>
// → bg-card text-card-foreground ring-border

// Ghost
<Button variant="ghost">투명</Button>
// → bg-transparent text-foreground hover:bg-muted
```

### Input / Select / Textarea

```tsx
<Input
  label="이름"
  placeholder="입력하세요"
/>
// → bg-card text-card-foreground border-border
// → placeholder:text-muted-foreground
```

### Card

```tsx
<div className="bg-card text-card-foreground border border-border/50 rounded-xl p-4">
  <h3 className="text-card-foreground">제목</h3>
  <p className="text-muted-foreground">설명</p>
  <button className="text-primary hover:text-primary/80">자세히</button>
</div>
```

## 색상 사용 규칙

### 1. 절대 하드코딩 금지

```tsx
❌ bg-white
❌ bg-gray-100
❌ text-green-500
❌ border-gray-200

✅ bg-card
✅ bg-muted
✅ text-primary
✅ border-border
```

### 2. 투명도 사용

```tsx
// 브랜드 컬러 강조
bg-primary/10  // 10% 투명도
border-primary // 100% 불투명

// 호버 효과
hover:bg-primary/5
hover:text-primary/80
```

### 3. 계층 구조

```tsx
// 페이지 배경
<body className="bg-background">

  {/* 카드 */}
  <div className="bg-card">

    {/* 제목 */}
    <h2 className="text-card-foreground">타이틀</h2>

    {/* 보조 텍스트 */}
    <p className="text-muted-foreground">설명</p>

    {/* 강조 */}
    <span className="text-primary">브랜드</span>
  </div>
</body>
```

## 다크모드 색상 반전 전략

### 1. 밝기 반전 원칙

다크모드에서는 **모든 색상의 밝기가 반전**됩니다:

```
라이트 모드          →  다크 모드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
밝은 배경 (#f8faf8)  →  어두운 배경 (#0f172a)
흰색 카드 (#ffffff)  →  어두운 카드 (#1e293b)
어두운 텍스트        →  밝은 텍스트
밝은 테두리          →  어두운 테두리
```

### 2. 카드는 배경보다 약간 밝은 어두운 톤

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0f172a;  /* slate-900 - 가장 어두움 */
    --card: #1e293b;        /* slate-800 - 약간 밝은 어두움 */
    --card-foreground: #f1f5f9;  /* slate-100 - 밝은 텍스트 */
  }
}
```

**이유:**
- 카드가 흰색이면 눈부심 (eye strain) 발생
- 계층 구조는 미묘한 밝기 차이로 표현
- `slate-900` (배경) < `slate-800` (카드) < `slate-700` (border)

### 3. 브랜드 컬러도 밝게

```css
/* 라이트: green-500 - 중간 톤 */
--primary: #50A76C;

/* 다크: green-400 - 더 밝은 톤 */
--primary: #5fc07f;
```

### 4. 텍스트 밝기 반전

```
라이트 모드                    다크 모드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
text-foreground: green-950   →  slate-100
text-muted-foreground: green-600  →  slate-400
```

## 체크리스트

새 컴포넌트 개발 시 확인사항:

- [ ] `bg-white` 대신 `bg-card` 사용
- [ ] `text-gray-*` 대신 `text-foreground` / `text-muted-foreground` 사용
- [ ] `border-gray-*` 대신 `border-border` 사용
- [ ] `bg-gray-*` 대신 `bg-muted` 사용
- [ ] 하드코딩된 색상 값 (`#xxx`) 없음
- [ ] 다크모드에서 텍스트 가독성 확인 (밝기 반전 적용)
- [ ] 카드가 어두운 배경에서 눈부시지 않은지 확인
- [ ] 호버/액티브 상태에서 색상 변화 자연스러움

## 참고

- 모든 색상은 [globals.css](../app/globals.css)에서 정의됨
- Tailwind v4 사용으로 CSS 변수가 자동으로 유틸리티 클래스로 변환됨
- `prefers-color-scheme: dark` 미디어쿼리로 자동 다크모드 적용
- 다크모드는 색상 밝기 반전 전략 적용
