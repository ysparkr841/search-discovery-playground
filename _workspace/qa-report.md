# QA 검증 리포트 — Search & Discovery Playground

> 작성자: **qa-inspector** · 작성일: 2026-06-10
> 방법: integration-qa 스킬(양쪽 동시 읽기 + Grep 대조 + 실제 빌드/린트/타입 실행)
> 자기보고 불신 원칙으로 contract.md / hooks-api.md / components-api.md 와 실제 소스를 1:1 교차 검증.

---

## 0. 최종 요약

| 항목 | 결과 |
| --- | --- |
| 통합 경계면 (7) | **전부 통과** |
| 기능 스펙 (9) | **전부 충족** |
| `npm run build` | **EXIT 0** (tsc -b && vite build, 78 modules, CSS 17.23kB) |
| `npx tsc --noEmit` | **EXIT 0** |
| `npx eslint .` | **EXIT 0** |
| `any` 사용 (src 전체) | **0건** |
| 자명한 버그 수정 | **0건** (수정할 결함 미발견) |
| 설계 보류 이슈 | **0건** (경미 관찰 1건만 기록) |

총평: 세 계약 문서와 실제 구현이 정확히 일치한다. 경계면 불일치(키 오타, shape 불일치, 라벨 중복정의, 콜백 시그니처 어긋남)는 발견되지 않았다. 수정이 필요한 결함이 없어 코드 변경은 하지 않았다.

---

## 1. 통합 정합성 (경계면 교차 비교) — 7/7 통과

### ✅ [1] Mock API 반환 shape ↔ usePlaceSearch 소비
- 생산자 `src/api/placesApi.ts:50` `fetchPlaces(): Promise<Place[]>` → `resolve([...PLACES])` 로 **배열 그 자체** 반환(래핑 없음).
- 소비자 `src/hooks/usePlaceSearch.ts:69-72` `useQuery<Place[], Error>`, `:78` `const all = data ?? []`, `:81` `all.filter(...)`.
- 배열을 곧바로 `.filter()` → `filter is not a function` 류 크래시 위험 없음. **일치.**

### ✅ [2] usePlaceSearch 반환 키 ↔ App.tsx 구조분해
- 훅 반환(`usePlaceSearch.ts:109-119`): `results, isLoading, isError, error, refetch, total, totalAll` (7키).
- App 구조분해(`App.tsx:81-89`): `{ results, isLoading, isError, error, refetch, total, totalAll }` — **7키 1:1 정확히 일치.** 누락/잉여 키 없음.
- `isLoading`은 내부 `isPending` 매핑(`:111`), `error`는 `error ?? null`(`:113`)로 계약(`Error | null`)과 일치.
- App이 실제 사용: `results`(map), `isLoading`/`isError`(분기), `error`(메시지), `refetch`(재시도), `total`(카운트), `totalAll`(empty 분기). 미사용 반환 키 없음.

### ✅ [3] 컴포넌트 props 인터페이스 ↔ App 호출부
| 컴포넌트 | props 정의 | App 호출부 | 결과 |
| --- | --- | --- | --- |
| SearchBar | `value, onChange, placeholder?, ariaLabel?` | `value={rawQuery} onChange={setRawQuery}` (`App:150`) | ✅ |
| CategoryFilter | `value:CategoryFilter, onChange` | `value={category} onChange={setCategory}` (`App:154`) | ✅ |
| SortSelect | `value:SortKey, onChange, ariaLabel?` | `value={sort} onChange={setSort}` (`App:172`) | ✅ |
| RecentSearches | `items, onSearchAgain, onRemove, onClearAll` | 4콜백 전부 전달 (`App:177-182`) | ✅ |
| PlaceCard | `place, query, isFavorite, onToggleFavorite` | 4개 전부 전달 (`App:251-255`) | ✅ |
| EmptyState | `message?` | `message={...}` (`App:240`) | ✅ |
| FavoriteToggle | `active, onToggle, label?, size?` | PlaceCard 내부 `active/onToggle/label`(`PlaceCard:63-67`) | ✅ |
- 콜백 시그니처: `onToggleFavorite: (id:number)=>void` ↔ App `handleToggleFavorite(id:number)`(`App:106`). PlaceCard가 `onToggle={() => onToggleFavorite(id)}`로 id 주입(`PlaceCard:65`). **일치.**

### ✅ [4] 카테고리 라벨 단일 출처
- `CATEGORY_LABELS` 는 `src/types/place.ts:69` 한 곳에서만 정의.
- CategoryFilter(`:9` import) · PlaceCard(`:10` import) 모두 동일 출처 사용. 하드코딩 한글 라벨 0.
- Grep 결과: 한글 카테고리/정렬 라벨 문자열은 (a) `types/place.ts` 상수, (b) `data/places.ts` 데이터/주석, (c) `App.tsx:145` 헤더 안내문(라벨이 아닌 마케팅 카피)에만 등장 → 라벨 중복정의 없음. **통과.**

### ✅ [5] SortKey 일관성
- SortSelect 옵션 값: `SORT_ORDER`(`types/place.ts:100`) = `["accuracy","latest","distance","rating"]`.
- sortPlaces 분기(`utils/sortPlaces.ts:19-31`): `latest`/`distance`/`rating`/`accuracy(default)` — **4키 전부 분기 존재, 동일.**

### ✅ [6] LocalStorage 키 단일 출처
- `STORAGE_KEYS` 는 `useLocalStorage.ts:10-13` 한 곳 정의(`sdp:recent-queries`, `sdp:favorite-ids`).
- App(`:71,:75`)이 상수로 호출. Grep상 키 문자열 리터럴은 정의부에만 존재 → **오타 0.**

### ✅ [7] highlightText 연결
- PlaceCard 가 `highlightText(name, query)`(`:71`), `(description, query)`(`:75`), `(tag, query)`(`:109`) 호출.
- App이 `query={debouncedQuery}` 전달(`App:253`) → 확정 검색어(디바운스 후). 시그니처 `(text:string, query:string): ReactNode` 와 일치.

---

## 2. 기능 스펙 준수 (블루프린트 9개) — 9/9 충족

- ✅ **1. 검색(300ms 디바운스 / 빈검색=전체)**: `App:60` `useDebounce(rawQuery, 300)`; `useDebounce.ts:15` 기본 300ms + clearTimeout cleanup. 빈 쿼리: `usePlaceSearch.ts:79,91` `normalizedQuery !== ""` 일 때만 필터 → 빈검색=전체.
- ✅ **2. 하이라이팅(정규식 이스케이프)**: `highlightText.tsx:7-9` `escapeRegExp`로 특수문자 이스케이프, `:28` `gi` 플래그(대소문자 무시·다중), `:24` 빈 쿼리는 원문 반환. 사용자 입력 정규식 크래시 방지 확인.
- ✅ **3. 카테고리 필터**: 전체+5종(`CATEGORY_FILTER_ORDER`), `usePlaceSearch.ts:83` `category !== "all" && place.category !== category`.
- ✅ **4. 4종 정렬 실동작**: `sortPlaces.ts` latest=`updatedAt` localeCompare 내림차순 / distance 오름차순 / rating 내림차순 / accuracy=원본순서. 데이터 분포가 다양해 가시적 동작(검증: distance 250~13400, rating 4.0~4.8, updatedAt 2026-03~06).
- ✅ **5. 최근검색어(최대5/중복제거/재검색/개별·전체삭제)**: `App:99-102` `[term, ...prev.filter(≠term)].slice(0,5)` (중복제거+최대5). 재검색 `handleSearchAgain→setRawQuery`(`:116`), 개별삭제 `handleRemoveRecent`(`:120`), 전체삭제 `handleClearRecent`(`:127`). RecentSearches도 자체 `slice(0,5)` 이중방어(`:29`).
- ✅ **6. 즐겨찾기(추가/제거/만보기)**: 토글 `App:106-113` (있으면 제거, 없으면 추가), 만보기 `favoritesOnly` 토글(`App:158`) → 훅 `:87` `favoritesOnly && !favoriteSet.has(id)`.
- ✅ **7. 결과카드 8개 표시항목**: PlaceCard에 장소명(`:71`)·카테고리(`:61`)·설명(`:75`)·거리(`:94`)·평점(`:91`)·업데이트일시(`:98`)·태그(`:104`)·즐겨찾기버튼(`:63`) — **8/8 전부 존재.**
- ✅ **8. EmptyState 문구**: `EmptyState.tsx:13` 기본값 = `"조건에 맞는 결과가 없습니다. 검색어를 줄이거나 필터를 변경해보세요."` — 스펙과 **문자 단위 정확 일치**(Grep 확인). 필터로 걸러진 빈 결과(`totalAll>0`)에서 이 기본 문구 사용(`App:241-245`).
- ✅ **9. TanStack Query 3상태 렌더**: `App:202` isLoading→스켈레톤, `:208` isError→에러카드(재시도 버튼), `:239/247` success→EmptyState 또는 결과 리스트. Mock은 Promise+setTimeout(`placesApi.ts:53-62`), 400~700ms 지연.
- ✅ **데이터 25~30개**: `places.ts` id 1~28, **총 28개**(restaurant 6/cafe 6/park 5/hospital 5/life 6). 범위 내.

---

## 3. 빌드 / 린트 / 타입 무결성 — 전부 EXIT 0

```
npx tsc --noEmit     → EXIT 0 (에러 0)
npx eslint .         → EXIT 0 (에러/경고 0)
npm run build        → EXIT 0 (tsc -b && vite build 성공)
                       78 modules, dist CSS 17.23kB(gzip 4.11kB), JS 246.18kB(gzip 76.99kB)
```

- **`any` 사용**: src 전체 Grep(`: any`, `<any>`, `as any` 등) → **0건.** 코드 품질 요구사항 충족.
- **미사용 import/변수**: eslint(`@typescript-eslint` + react-hooks 규칙) EXIT 0 → 미사용 0. App의 `useCallback/useEffect/useMemo/useState` 모두 사용처 확인.
- **react-hooks 규칙**: usePlaceSearch `useMemo` deps(`:107` `[data, query, category, favoritesOnly, favoriteSet, sort]`) 완전. App effect deps(`:103`)도 경고 없음.

---

## 4. 디자인 품질 — 통과

- ✅ **오렌지/화이트/그레이 토큰**: `index.css:13-51` `@theme`에 `--color-primary #ff6f0f`(오렌지), `--color-surface #ffffff`(화이트), `--color-surface-muted #f7f8fa`(연그레이) 등 정의. components-api.md 토큰 표와 1:1 일치.
- ✅ **토큰 실사용**: 컴포넌트가 `bg-primary`/`text-primary`/`bg-surface-muted`/`text-ink`/`rounded-card`/`shadow-card` 등 토큰 유틸 사용(하드코딩 hex 없음). 빌드 CSS 17.23kB로 Tailwind 정상 주입 확인.
- ✅ **카드 UI 완성도**: PlaceCard 카테고리 배지·하트·하이라이팅·별 SVG·거리/날짜 포맷·태그칩 + `hover:shadow-card-hover`.
- ✅ **반응형**: PlaceCard `p-4 sm:p-5`(`:54`), 컨테이너 `max-w-2xl`(`App:140`), CategoryFilter `flex-wrap overflow-x-auto`. 모바일 대응 확인.
- ✅ **로딩/에러/empty 시각처리**: 로딩=animate-pulse 스켈레톤 4장(`App:35,202`), 에러=role="alert" 카드+재시도(`:208`), empty=role="status" 아이콘+문구(`EmptyState`). 3상태 모두 시각 처리 완비.

---

## 5. 경미 관찰 (결함 아님 · 수정 불필요)

- **EmptyState 분기 메시지**(`App:239-246`): `totalAll === 0`(서버 데이터 자체가 0)일 때만 `"표시할 장소가 없습니다."`, 그 외(필터로 걸러진 경우)는 스펙 기본 문구. Mock은 항상 28개를 반환하므로 실사용에서 `totalAll===0` 분기는 사실상 도달 불가하나, 방어적 처리로 합리적. 스펙 위반 아님.
- **즐겨찾기만 보기 + 즐겨찾기 0개**: `favoritesOnly=true`인데 즐겨찾기가 없으면 `totalAll>0`이라 스펙 기본 문구("조건에 맞는 결과가 없습니다...")가 노출됨. 의미상 자연스러움 — 변경 불필요.

위 두 항목은 설계 의도에 부합하며 수정하지 않았다.

---

## 6. 미검증 항목

- **런타임/브라우저 인터랙션**: 본 검증은 정적 교차분석 + 빌드/타입/린트 실행 기반이다. 실제 클릭/디바운스 타이밍/localStorage 영속의 브라우저 E2E 동작은 미실행(코드 경로상으로는 정합). 필요 시 `npm run dev` 후 chrome-devtools로 확인 권장.
