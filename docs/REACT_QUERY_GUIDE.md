# React Query 사용 가이드

## 목차
1. [Query Key 관리](#query-key-관리)
2. [데이터 페칭 패턴](#데이터-페칭-패턴)
3. [Mutation 패턴](#mutation-패턴)
4. [캐시 관리](#캐시-관리)
5. [에러 처리](#에러-처리)
6. [베스트 프랙티스](#베스트-프랙티스)

---

## Query Key 관리

### ❌ 현재 문제점

```typescript
// lib/hooks/useAuth.ts
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],  // 하드코딩된 문자열
    queryFn: api.getCurrentUser,
  });
}

export function useCheckNickname(nickname: string) {
  return useQuery({
    queryKey: ['user', 'check-nickname', nickname],  // 반복되는 패턴
    queryFn: () => api.checkNickname(nickname),
  });
}
```

**문제점:**
- 타입 안전성 부족 (오타 가능성)
- 재사용 불가
- 캐시 무효화 시 문자열 복사 필요
- 리팩토링 어려움

### ✅ 권장 패턴: Query Key Factory

#### 1단계: Query Key 상수 정의

```typescript
// lib/constants/queryKeys.ts (새로 생성 필요)

export const queryKeys = {
  // User 관련
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
    detail: (id: string) => [...queryKeys.user.all, 'detail', id] as const,
    checkNickname: (nickname: string) =>
      [...queryKeys.user.all, 'check-nickname', nickname] as const,
  },

  // Post/Content 관련 (예시)
  post: {
    all: ['post'] as const,
    lists: () => [...queryKeys.post.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.post.lists(), filters] as const,
    details: () => [...queryKeys.post.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.post.details(), id] as const,
  },

  // Product 관련 (예시)
  product: {
    all: ['product'] as const,
    lists: () => [...queryKeys.product.all, 'list'] as const,
    list: (filters?: ProductFilters) =>
      [...queryKeys.product.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.product.all, 'detail', id] as const,
  },
} as const;
```

#### 2단계: 커스텀 훅에서 사용

```typescript
// lib/hooks/useAuth.ts
import { queryKeys } from '@/lib/constants/queryKeys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.me(),  // ✅ 타입 안전
    queryFn: api.getCurrentUser,
  });
}

export function useCheckNickname(nickname: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.checkNickname(nickname),
    queryFn: () => api.checkNickname(nickname),
    enabled: enabled && nickname.length >= 2,
  });
}
```

#### 3단계: 캐시 무효화

```typescript
// Mutation 성공 시 관련 쿼리 무효화
queryClient.invalidateQueries({
  queryKey: queryKeys.user.all,  // user로 시작하는 모든 쿼리 무효화
});

// 특정 쿼리만 무효화
queryClient.invalidateQueries({
  queryKey: queryKeys.user.me(),
});
```

### Query Key 계층 구조

```typescript
['user']                           // 모든 user 쿼리
['user', 'me']                     // 현재 사용자
['user', 'detail', '123']          // 특정 사용자
['user', 'check-nickname', 'abc']  // 닉네임 중복 확인

['product']                        // 모든 product 쿼리
['product', 'list']                // 모든 product 목록
['product', 'list', {...filters}]  // 필터링된 목록
['product', 'detail', '456']       // 특정 product
```

**원칙:**
1. 범용적인 것부터 구체적인 순서
2. 배열 형태 유지 (`as const`)
3. 동적 값은 마지막에 추가

---

## 데이터 페칭 패턴

### 1. useQuery 기본 패턴

```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: queryKeys.user.me(),
  queryFn: api.getCurrentUser,

  // 옵션
  staleTime: 60 * 1000,     // 1분간 fresh 유지
  gcTime: 5 * 60 * 1000,    // 5분간 캐시 유지
  retry: 1,                  // 실패 시 1회 재시도
  enabled: true,             // 조건부 실행
});
```

### 2. 조건부 쿼리

```typescript
// nickname이 2글자 이상일 때만 실행
export function useCheckNickname(nickname: string) {
  return useQuery({
    queryKey: queryKeys.user.checkNickname(nickname),
    queryFn: () => api.checkNickname(nickname),
    enabled: nickname.length >= 2,  // 조건부 실행
  });
}
```

### 3. 의존성이 있는 쿼리

```typescript
// userId가 있을 때만 사용자 상세 조회
function UserProfile({ userId }: Props) {
  const { data: user } = useQuery({
    queryKey: queryKeys.user.detail(userId),
    queryFn: () => api.getUserDetail(userId),
    enabled: !!userId,  // userId 존재 시에만 실행
  });

  // user가 있을 때만 게시글 조회
  const { data: posts } = useQuery({
    queryKey: queryKeys.post.list(userId),
    queryFn: () => api.getUserPosts(userId),
    enabled: !!user,  // user 쿼리 완료 후 실행
  });
}
```

### 4. 초기 데이터 제공

```typescript
const { data } = useQuery({
  queryKey: queryKeys.user.detail(userId),
  queryFn: () => api.getUserDetail(userId),
  initialData: cachedUser,  // 초기값 설정
});
```

---

## Mutation 패턴

### 1. useMutation 기본 패턴

```typescript
const mutation = useMutation({
  mutationFn: api.updateProfile,

  // 성공 시
  onSuccess: (data) => {
    // 캐시 업데이트
    queryClient.setQueryData(queryKeys.user.me(), data);

    // 관련 쿼리 무효화
    queryClient.invalidateQueries({
      queryKey: queryKeys.user.all,
    });
  },

  // 에러 시
  onError: (error) => {
    console.error('Update failed:', error);
  },

  // 완료 시 (성공/실패 무관)
  onSettled: () => {
    console.log('Mutation completed');
  },
});

// 사용
mutation.mutate(profileData);
```

### 2. 낙관적 업데이트 (Optimistic Update)

```typescript
const updateProfileMutation = useMutation({
  mutationFn: api.updateProfile,

  onMutate: async (newProfile) => {
    // 진행 중인 쿼리 취소
    await queryClient.cancelQueries({
      queryKey: queryKeys.user.me(),
    });

    // 이전 값 백업
    const previousUser = queryClient.getQueryData(queryKeys.user.me());

    // 낙관적 업데이트
    queryClient.setQueryData(queryKeys.user.me(), (old) => ({
      ...old,
      ...newProfile,
    }));

    // 롤백용 컨텍스트 반환
    return { previousUser };
  },

  onError: (err, newProfile, context) => {
    // 에러 시 롤백
    queryClient.setQueryData(
      queryKeys.user.me(),
      context.previousUser
    );
  },

  onSettled: () => {
    // 서버 데이터로 재조회
    queryClient.invalidateQueries({
      queryKey: queryKeys.user.me(),
    });
  },
});
```

### 3. 여러 Mutation 연계

```typescript
const signupFlow = () => {
  const verifyPassMutation = useMutation({ ... });
  const saveMilitaryInfoMutation = useMutation({ ... });
  const completeSignupMutation = useMutation({
    mutationFn: api.completeSignup,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user.me(), data);
      router.push('/');
    },
  });

  const handleSignup = async (data) => {
    await verifyPassMutation.mutateAsync(passData);
    await saveMilitaryInfoMutation.mutateAsync(militaryData);
    await completeSignupMutation.mutateAsync(signupData);
  };
};
```

---

## 캐시 관리

### 1. 캐시 읽기

```typescript
// 특정 쿼리 캐시 가져오기
const user = queryClient.getQueryData(queryKeys.user.me());

// 모든 user 쿼리 가져오기
const allUserQueries = queryClient.getQueriesData({
  queryKey: queryKeys.user.all,
});
```

### 2. 캐시 쓰기

```typescript
// 캐시 직접 설정
queryClient.setQueryData(queryKeys.user.me(), newUserData);

// 함수형 업데이트
queryClient.setQueryData(queryKeys.user.me(), (oldData) => ({
  ...oldData,
  nickname: 'newNickname',
}));
```

### 3. 캐시 무효화

```typescript
// 특정 쿼리 무효화 (재조회)
queryClient.invalidateQueries({
  queryKey: queryKeys.user.me(),
});

// 모든 user 쿼리 무효화
queryClient.invalidateQueries({
  queryKey: queryKeys.user.all,
});

// 조건부 무효화
queryClient.invalidateQueries({
  queryKey: queryKeys.product.all,
  predicate: (query) =>
    query.state.data?.category === 'electronics',
});
```

### 4. 캐시 제거

```typescript
// 특정 쿼리 캐시 제거
queryClient.removeQueries({
  queryKey: queryKeys.user.detail('123'),
});

// 모든 캐시 초기화 (로그아웃 시)
queryClient.clear();
```

### 5. 프리페칭 (Prefetching)

```typescript
// 사용자가 볼 가능성이 높은 데이터 미리 로드
await queryClient.prefetchQuery({
  queryKey: queryKeys.product.detail(productId),
  queryFn: () => api.getProduct(productId),
  staleTime: 10 * 1000,  // 10초간 fresh
});
```

---

## 에러 처리

### 1. 쿼리 레벨 에러 처리

```typescript
const { data, error, isError } = useQuery({
  queryKey: queryKeys.user.me(),
  queryFn: api.getCurrentUser,
});

if (isError) {
  return <ErrorState message={error.message} />;
}
```

### 2. 전역 에러 처리

```typescript
// lib/providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        // 전역 에러 토스트 표시
        toast.error(error.message);
      },
    },
    mutations: {
      onError: (error) => {
        toast.error('작업 중 오류가 발생했습니다');
      },
    },
  },
});
```

### 3. Mutation 에러 처리

```typescript
const mutation = useMutation({
  mutationFn: api.updateProfile,
  onError: (error) => {
    if (error.status === 409) {
      alert('닉네임이 이미 사용 중입니다');
    } else {
      alert('프로필 업데이트에 실패했습니다');
    }
  },
});
```

---

## 베스트 프랙티스

### 1. ✅ DO

```typescript
// ✅ Query Key 상수 사용
queryKey: queryKeys.user.me()

// ✅ 타입 정의
const { data, isLoading } = useQuery<User, Error>({ ... })

// ✅ 로딩/에러 상태 처리
if (isLoading) return <Skeleton />;
if (error) return <ErrorState />;

// ✅ onSuccess에서 캐시 업데이트
onSuccess: (data) => {
  queryClient.setQueryData(queryKeys.user.me(), data);
}

// ✅ enabled로 조건부 실행
enabled: !!userId && isReady
```

### 2. ❌ DON'T

```typescript
// ❌ 하드코딩된 Query Key
queryKey: ['user', 'me']

// ❌ useEffect에서 fetch
useEffect(() => {
  fetch('/api/user/me').then(...)
}, []);

// ❌ 무분별한 refetch
queryClient.invalidateQueries();  // 모든 쿼리 무효화

// ❌ Mutation에서 직접 상태 변경
const [user, setUser] = useState();
mutation.mutate(data, {
  onSuccess: (newData) => setUser(newData)  // 캐시와 불일치
});
```

### 3. 성능 최적화

```typescript
// staleTime 설정으로 불필요한 재조회 방지
staleTime: 5 * 60 * 1000,  // 5분

// select로 필요한 데이터만 구독
const nickname = useQuery({
  queryKey: queryKeys.user.me(),
  queryFn: api.getCurrentUser,
  select: (data) => data.nickname,  // nickname만 구독
});

// keepPreviousData로 페이지네이션 UX 개선
const { data, isLoading, isPreviousData } = useQuery({
  queryKey: queryKeys.product.list(page),
  queryFn: () => api.getProducts(page),
  keepPreviousData: true,  // 이전 데이터 유지
});
```

---

## 마이그레이션 체크리스트

### 현재 프로젝트에 적용할 작업

- [ ] `lib/constants/queryKeys.ts` 파일 생성
- [ ] `queryKeys` 객체 정의
  - [ ] user
  - [ ] post (필요 시)
  - [ ] product (필요 시)
- [ ] `lib/hooks/useAuth.ts`의 Query Key를 상수로 변경
- [ ] 기타 훅에도 적용
- [ ] 캐시 무효화 코드 리팩토링

---

**작성일:** 2024-12-19
**버전:** 1.0.0
