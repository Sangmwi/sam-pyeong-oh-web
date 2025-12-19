# 루티너스 웹 아키텍처 문서

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [데이터 페칭 패턴](#데이터-페칭-패턴)
5. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
6. [스타일링 접근](#스타일링-접근)
7. [상태 관리](#상태-관리)
8. [코드 조직화](#코드-조직화)

---

## 프로젝트 개요

**루티너스(Rutiners)** - 현역 군인을 위한 헬스/피트니스 플랫폼

- Next.js 16 App Router 기반 웹 애플리케이션
- React 19 + TypeScript
- Supabase 백엔드 (PostgreSQL + Auth)
- React Query를 통한 서버 상태 관리
- Tailwind CSS v4 스타일링

---

## 기술 스택

### 핵심 프레임워크
- **Next.js 16.0.10** (App Router)
- **React 19.2.1**
- **TypeScript 5.x**

### 백엔드 & 데이터
- **Supabase**
  - `@supabase/ssr` - SSR 지원
  - `@supabase/supabase-js` - 클라이언트 SDK
- **React Query 5.90.12** (`@tanstack/react-query`)

### UI & 스타일링
- **Tailwind CSS v4** - Utility-first CSS
- **Lucide React** - 아이콘 라이브러리
- **Pretendard Variable** - 커스텀 폰트

### 개발 도구
- **ESLint** + **Prettier** - 코드 품질
- **SVGR** - SVG를 React 컴포넌트로 변환

---

## 프로젝트 구조

```
sam-pyeong-oh-web/
├── app/                      # Next.js App Router 페이지
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈 페이지
│   ├── login/               # 로그인 페이지
│   ├── signup/              # 회원가입 페이지
│   ├── profile/             # 프로필 페이지
│   ├── community/           # 커뮤니티 페이지
│   ├── ai/                  # AI 상담 페이지
│   ├── api/                 # API Routes
│   │   ├── signup/
│   │   │   └── complete/    # 회원가입 완료 API
│   │   ├── user/
│   │   │   ├── me/          # 현재 사용자 조회
│   │   │   ├── profile/     # 프로필 업데이트
│   │   │   └── check-nickname/ # 닉네임 중복 확인
│   │   └── auth/
│   │       └── callback/    # OAuth 콜백
│   └── globals.css          # 전역 스타일
│
├── components/              # React 컴포넌트
│   ├── ui/                  # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── StepIndicator.tsx
│   │   └── image-with-fallback.tsx
│   ├── common/              # 공통 컴포넌트
│   │   └── BottomNav.tsx
│   ├── home/                # 홈 페이지 전용
│   │   ├── GreetingSection.tsx
│   │   ├── HealthScoreCard.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── ProductCard.tsx
│   │   ├── InfluencerCard.tsx
│   │   └── InfluencerSlider.tsx
│   ├── profile/             # 프로필 페이지 전용
│   │   ├── ProfileHeader.tsx
│   │   ├── BodyInfoSection.tsx
│   │   ├── InterestsSection.tsx
│   │   └── SettingsSection.tsx
│   ├── signup/              # 회원가입 플로우
│   │   ├── PassVerificationStep.tsx
│   │   ├── MilitaryInfoStep.tsx
│   │   ├── ConfirmationStep.tsx
│   │   └── UnitSearch.tsx
│   └── WebViewBridge.tsx    # React Native WebView 통신
│
├── lib/                     # 비즈니스 로직 & 유틸리티
│   ├── hooks/               # 커스텀 훅
│   │   ├── useAuth.ts       # 인증 & 사용자 관련 훅
│   │   └── useForm.ts       # 폼 관리 훅
│   ├── types/               # TypeScript 타입 정의
│   │   ├── index.ts
│   │   └── user.ts
│   ├── providers/           # React Context Providers
│   │   └── QueryProvider.tsx
│   ├── constants/           # 상수 데이터
│   │   ├── military.ts      # 군 관련 상수 (계급, 병과 등)
│   │   └── units.ts         # 부대 데이터
│   ├── database.types.ts    # Supabase 자동 생성 타입
│   └── routes.ts            # 라우트 상수
│
├── utils/                   # 순수 유틸리티 함수
│   └── supabase/
│       ├── client.ts        # 브라우저 클라이언트
│       └── server.ts        # 서버 클라이언트
│
├── hooks/                   # 전역 훅
│   └── use-webview-bridge.ts
│
├── middleware.ts            # Next.js 미들웨어 (인증, 라우팅)
└── docs/                    # 프로젝트 문서
    └── ARCHITECTURE.md
```

---

## 데이터 페칭 패턴

### 1. API Layer 구조

#### API Routes (`app/api/`)
Next.js API Routes를 사용한 백엔드 엔드포인트

```typescript
// app/api/user/me/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();

  // 데이터 조회
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('provider_id', user.id)
    .single();

  return NextResponse.json(data);
}
```

**특징:**
- Server Components에서 직접 Supabase 호출 가능
- API Routes는 클라이언트-서버 간 추상화 레이어
- 인증/권한 체크를 중앙화

#### API 클라이언트 함수 (`lib/hooks/useAuth.ts`)

```typescript
const api = {
  async getCurrentUser(): Promise<User | null> {
    const response = await fetch('/api/user/me');
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  async completeSignup(data: SignupCompleteData): Promise<User> {
    const response = await fetch('/api/signup/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to complete signup');
    return response.json();
  },
};
```

**특징:**
- 각 API 엔드포인트에 대응하는 함수
- 타입 안전성 보장
- 에러 처리 중앙화

### 2. React Query 통합

#### QueryProvider 설정

```typescript
// lib/providers/QueryProvider.tsx
const [queryClient] = useState(() =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 1분
        gcTime: 5 * 60 * 1000,       // 5분 (구 cacheTime)
        refetchOnWindowFocus: false, // 포커스 시 재조회 비활성화
        retry: 1,                     // 1회 재시도
      },
    },
  })
);
```

#### 커스텀 훅 패턴

```typescript
// lib/hooks/useAuth.ts
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: api.getCurrentUser,
  });
}

export function useCompleteSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.completeSignup,
    onSuccess: (data) => {
      // 캐시 업데이트
      queryClient.setQueryData(['user', 'me'], data);
    },
  });
}
```

### 3. Query Key 관리 ⚠️ **개선 필요**

**현재 상태:**
```typescript
// 하드코딩된 Query Keys
queryKey: ['user', 'me']
queryKey: ['user', 'check-nickname', nickname]
```

**권장 패턴:**
```typescript
// lib/constants/queryKeys.ts (생성 필요)
export const queryKeys = {
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
    checkNickname: (nickname: string) =>
      [...queryKeys.user.all, 'check-nickname', nickname] as const,
  },
} as const;

// 사용
queryKey: queryKeys.user.me()
```

**개선 효과:**
- 타입 안전성 향상
- 중복 방지
- 쉬운 캐시 무효화
- 리팩토링 시 안전성

### 4. 데이터 변환 패턴

#### Backend (snake_case) ↔ Frontend (camelCase)

```typescript
// API Route에서 변환
const transformedUser = {
  id: newUser.id,
  providerId: newUser.provider_id,
  realName: newUser.real_name,
  phoneNumber: newUser.phone_number,
  // ...
};
```

---

## 컴포넌트 아키텍처

### 1. 컴포넌트 분류

#### UI 컴포넌트 (`components/ui/`)
**목적:** 재사용 가능한 기본 UI 빌딩 블록

```typescript
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}
```

**특징:**
- Props를 통한 커스터마이징
- 비즈니스 로직 없음
- Headless 패턴 지향

#### 도메인 컴포넌트 (`components/[domain]/`)
**목적:** 특정 페이지/도메인 전용 컴포넌트

```typescript
// components/home/HealthScoreCard.tsx
interface HealthScoreCardProps {
  score: number;
  onViewDetails: () => void;
}
```

**특징:**
- 도메인 지식 포함
- UI 컴포넌트 조합
- 페이지별로 폴더 분리

#### 공통 컴포넌트 (`components/common/`)
**목적:** 여러 페이지에서 공유되는 레이아웃 컴포넌트

```typescript
// BottomNav.tsx - 하단 네비게이션
```

### 2. 컴포넌트 패턴

#### Props 타입 정의
```typescript
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}
```

#### forwardRef 사용
```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return <button ref={ref} {...props}>{children}</button>;
  }
);
Button.displayName = 'Button';
```

#### 컴포지션 패턴
```typescript
// 작은 컴포넌트를 조합
<div className="grid grid-cols-2 gap-4">
  {products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ))}
</div>
```

---

## 스타일링 접근

### Tailwind CSS v4 Utility-First

#### 기본 스타일 패턴
```typescript
const baseStyles =
  'inline-flex items-center justify-center gap-2 ' +
  'rounded-xl font-medium transition-all duration-200 ' +
  'active:scale-[0.98] disabled:opacity-50';

const variantStyles = {
  primary: 'bg-primary text-primary-foreground shadow-md',
  outline: 'bg-white ring-1 ring-gray-200 hover:ring-gray-300',
};
```

#### CSS Variables (Tailwind Config)
```css
/* globals.css */
@theme {
  --color-primary: oklch(66.89% 0.229 166.29);
  --color-background: #fafafa;
}
```

#### 반응형 디자인
```typescript
className="mx-auto max-w-md" // 모바일 우선 (최대 너비 28rem)
```

#### 다크모드 대비
```typescript
className="bg-background text-foreground" // CSS 변수 사용
```

---

## 상태 관리

### 1. 서버 상태 (React Query)

**담당 영역:**
- 사용자 데이터
- API 응답 캐싱
- 낙관적 업데이트

```typescript
const { data: user, isLoading, error } = useCurrentUser();
```

### 2. 로컬 상태 (useState, useReducer)

**담당 영역:**
- 폼 입력
- UI 상태 (모달, 토글 등)
- 페이지별 임시 데이터

```typescript
const [currentStep, setCurrentStep] = useState(1);
const [passData, setPassData] = useState<PassVerificationData | null>(null);
```

### 3. URL 상태 (useRouter, useSearchParams)

**담당 영역:**
- 페이지 네비게이션
- 쿼리 파라미터

```typescript
const router = useRouter();
router.push('/profile');
```

### 4. 전역 상태 ❌ **현재 없음**

**필요시 고려:**
- React Context (간단한 전역 상태)
- Zustand (복잡한 상태)

---

## 코드 조직화

### 1. 관심사 분리 (Separation of Concerns)

#### ✅ **좋은 예:**
```typescript
// lib/hooks/useAuth.ts - 데이터 로직
const api = {
  getCurrentUser: () => fetch('/api/user/me')
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: api.getCurrentUser
  });
}

// components/home/GreetingSection.tsx - UI 로직
export default function GreetingSection({ nickname }: Props) {
  return <h1>안녕하세요, {nickname}님!</h1>;
}

// app/page.tsx - 페이지 조합
const { data: user } = useCurrentUser();
return <GreetingSection nickname={user?.nickname} />;
```

### 2. 파일 명명 규칙

- **컴포넌트:** PascalCase (`Button.tsx`, `HealthScoreCard.tsx`)
- **훅:** camelCase + `use` 접두사 (`useAuth.ts`, `useForm.ts`)
- **유틸:** camelCase (`routes.ts`, `military.ts`)
- **타입:** PascalCase + `.types.ts` (`database.types.ts`)

### 3. Import 순서

```typescript
// 1. 외부 라이브러리
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

// 2. 내부 절대 경로
import { useCurrentUser } from '@/lib/hooks/useAuth';
import Button from '@/components/ui/Button';

// 3. 상대 경로
import './styles.css';
```

### 4. 타입 정의 위치

```typescript
// lib/types/user.ts - 도메인 타입
export interface User { ... }
export interface SignupCompleteData { ... }

// 컴포넌트 파일 - Props 타입 (컴포넌트와 함께)
interface GreetingSectionProps {
  nickname: string;
}
```

---

## 베스트 프랙티스 체크리스트

### ✅ 현재 적용 중
- [x] TypeScript 타입 안전성
- [x] React Query로 서버 상태 관리
- [x] 컴포넌트 도메인별 폴더 분리
- [x] UI 컴포넌트 재사용
- [x] Tailwind CSS Utility-first
- [x] Next.js App Router
- [x] Supabase RLS 보안

### ⚠️ 개선 필요
- [ ] **Query Key 상수화** (최우선)
- [ ] EmptyState, ErrorState 공통 컴포넌트
- [ ] Skeleton 로딩 컴포넌트
- [ ] PageHeader (뒤로가기) 컴포넌트
- [ ] 에러 바운더리
- [ ] 폼 검증 라이브러리 (React Hook Form 고려)

---

## 다음 단계

1. **Query Key 관리 개선**
   - `lib/constants/queryKeys.ts` 생성
   - 모든 훅에 상수 적용

2. **공통 컴포넌트 구축**
   - PageHeader, EmptyState, ErrorState
   - Skeleton 컴포넌트

3. **에러 처리 표준화**
   - Error Boundary 구현
   - 전역 에러 토스트

4. **성능 최적화**
   - React.memo 적용
   - 코드 스플리팅
   - 이미지 최적화

---

**작성일:** 2024-12-19
**버전:** 1.0.0
