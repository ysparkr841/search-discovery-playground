# 컴포넌트 API (Components API) — UI 표현 계층

> 작성자: **ui-builder** · 최종 갱신: 2026-06-10
> integrator 가 `App.tsx` 조립 시 이 props 인터페이스를 그대로 참조한다.
> 모든 컴포넌트는 **순수**하다(전역 상태/훅 직접 접근 없음). 동작은 콜백 props로 위임.
> 라벨/순서/타입은 `src/types/place.ts` 단일 출처에서 import. 하이라이팅은 `src/utils/highlightText.tsx`.

모든 컴포넌트는 **default export** 다. props 인터페이스는 named export(`{Name}Props`).

```ts
import SearchBar from "./components/SearchBar";
import CategoryFilter from "./components/CategoryFilter";
import SortSelect from "./components/SortSelect";
import RecentSearches from "./components/RecentSearches";
import PlaceCard from "./components/PlaceCard";
import EmptyState from "./components/EmptyState";
import FavoriteToggle from "./components/FavoriteToggle";
```

---

## 1. SearchBar (`src/components/SearchBar.tsx`)

검색 입력창. 검색 아이콘 + 클리어(×) 버튼. **디바운스 없음** — raw value를 그대로 위로 전달.

```ts
export interface SearchBarProps {
  value: string;                       // 제어 입력값
  onChange: (value: string) => void;   // raw value 그대로 전달(클리어 시 "")
  placeholder?: string;                // 기본 "장소, 카테고리, 태그로 검색"
  ariaLabel?: string;                  // 기본 "장소 검색"
}
```

조립 메모: `onChange`에 훅의 setQuery(또는 raw 입력 setter)를 연결. 디바운스는 훅에서.

---

## 2. CategoryFilter (`src/components/CategoryFilter.tsx`)

카테고리 칩 그룹(전체 + 5종). 순서/라벨은 `CATEGORY_FILTER_ORDER` + `CATEGORY_LABELS`. 선택 칩 오렌지 강조.

```ts
import type { CategoryFilter } from "../types/place";

export interface CategoryFilterProps {
  value: CategoryFilter;                  // "all" | "restaurant" | "cafe" | "park" | "hospital" | "life"
  onChange: (value: CategoryFilter) => void;
}
```

---

## 3. SortSelect (`src/components/SortSelect.tsx`)

정렬 셀렉트(정확도/최신/거리/평점). 옵션 순서/라벨은 `SORT_ORDER` + `SORT_LABELS`.

```ts
import type { SortKey } from "../types/place";

export interface SortSelectProps {
  value: SortKey;                      // "accuracy" | "latest" | "distance" | "rating"
  onChange: (value: SortKey) => void;
  ariaLabel?: string;                  // 기본 "정렬 기준"
}
```

---

## 4. RecentSearches (`src/components/RecentSearches.tsx`)

최근 검색어 칩 그룹. **앞에서부터 최대 5개**만 표시(슬라이싱은 컴포넌트 내부에서 처리).
items가 비면 `null` 렌더(아무것도 그리지 않음).

```ts
export interface RecentSearchesProps {
  items: string[];                          // 최근 검색어(컴포넌트가 5개로 자름)
  onSearchAgain: (term: string) => void;    // 칩 본문 클릭(재검색)
  onRemove: (term: string) => void;         // 개별 × 클릭
  onClearAll: () => void;                   // 전체삭제
}
```

---

## 5. PlaceCard (`src/components/PlaceCard.tsx`)

결과 카드. 장소명·설명·태그에 `highlightText(text, query)` 적용. 내부에서 FavoriteToggle 사용.
거리 포맷(1000m 미만 `m`, 이상 `km`)과 날짜 포맷(`YYYY.MM.DD`)은 컴포넌트 내부 유틸.

```ts
import type { Place } from "../types/place";

export interface PlaceCardProps {
  place: Place;                          // 표시 데이터
  query: string;                         // 하이라이팅용 검색어(""이면 강조 없음)
  isFavorite: boolean;                   // 즐겨찾기 여부
  onToggleFavorite: (id: number) => void; // place.id와 함께 호출
}
```

조립 메모: 리스트 렌더 시 `key={place.id}`, `query`는 **확정 검색어(디바운스 후 값)** 를 넘기는 것을 권장.
`isFavorite`는 훅의 즐겨찾기 집합으로 `favorites.has(place.id)` 형태 계산해 전달.

---

## 6. EmptyState (`src/components/EmptyState.tsx`)

빈 결과 안내. 기본 문구는 계약 고정 문자열.

```ts
export interface EmptyStateProps {
  message?: string; // 기본: "조건에 맞는 결과가 없습니다. 검색어를 줄이거나 필터를 변경해보세요."
}
```

---

## 7. FavoriteToggle (`src/components/FavoriteToggle.tsx`)

즐겨찾기(하트) 토글 버튼. 오렌지 채움. `aria-label` + `aria-pressed` 포함.
(PlaceCard가 내부에서 사용하지만, 독립 사용도 가능.)

```ts
export interface FavoriteToggleProps {
  active: boolean;        // true면 오렌지 채움 하트
  onToggle: () => void;   // 토글 클릭(id 전달은 상위 책임)
  label?: string;         // 지정 시 aria-label에 "{label} 즐겨찾기 추가/해제"
  size?: number;          // 버튼 크기(px), 기본 36
}
```

---

## 디자인 토큰 (src/index.css `@theme`)

Tailwind v4 — `--color-*`는 `bg-*`/`text-*`/`border-*` 유틸로, `--radius-*`는 `rounded-*`,
`--shadow-*`는 `shadow-*`, `--text-*`는 `text-*` 유틸로 자동 생성됨.

| 토큰 | 값 | 유틸 예 |
| --- | --- | --- |
| `--color-primary` | `#ff6f0f` | `bg-primary` `text-primary` |
| `--color-primary-hover` | `#e85f00` | `hover:bg-primary-hover` |
| `--color-primary-soft` | `#fff2e8` | `bg-primary-soft` (선택 틴트) |
| `--color-primary-fg` | `#ffffff` | `text-primary-fg` |
| `--color-surface` | `#ffffff` | `bg-surface` |
| `--color-surface-muted` | `#f7f8fa` | `bg-surface-muted` (연그레이 카드) |
| `--color-surface-sunken` | `#eef0f3` | `bg-surface-sunken` |
| `--color-border` | `#ebedf0` | `border-border` |
| `--color-border-strong` | `#d7dbe0` | `border-border-strong` |
| `--color-ink` | `#1a1d20` | `text-ink` (제목) |
| `--color-ink-secondary` | `#4e5560` | `text-ink-secondary` (본문) |
| `--color-ink-muted` | `#8b919a` | `text-ink-muted` (캡션) |
| `--color-star` | `#ffb020` | `text-star` (별점) |
| `--radius-card` / `-lg` | `1rem` / `1.25rem` | `rounded-card` `rounded-card-lg` |
| `--radius-chip` | `999px` | `rounded-chip` |
| `--shadow-card` / `-hover` | soft | `shadow-card` `shadow-card-hover` |
| `--text-title` | `20px/1.4` | `text-title` |
| `--text-body` | `15px/1.55` | `text-body` |
| `--text-caption` | `13px/1.4` | `text-caption` |

> scaffold가 만든 `@import "tailwindcss"`는 보존했고 `@theme` 블록만 확장했다.

---

## 검증

- `npx tsc --noEmit` : **에러 0**
- `any` 사용 : **0건**
- `highlightText(text: string, query: string): ReactNode` 시그니처와 일치(import만, 자체 구현 없음).
