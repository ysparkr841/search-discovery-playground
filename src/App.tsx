/**
 * App — 검색 화면 전체 조립(integrator).
 *
 * 상태의 단일 출처:
 * - rawQuery(입력) → useDebounce → debouncedQuery(확정 검색어)
 * - category(CategoryFilter), sort(SortKey), favoritesOnly(boolean)
 * - 최근 검색어 / 즐겨찾기 id 는 useLocalStorage 로 영속화
 *
 * 데이터 흐름:
 *   App 상태 → usePlaceSearch(단일 입력 객체) → { results, isLoading, isError, error, refetch, total, totalAll }
 *   → loading/error/success 3상태 분기 렌더.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import CategoryFilter from "./components/CategoryFilter";
import EmptyState from "./components/EmptyState";
import PlaceCard from "./components/PlaceCard";
import RecentSearches from "./components/RecentSearches";
import SearchBar from "./components/SearchBar";
import SortSelect from "./components/SortSelect";
import { useDebounce } from "./hooks/useDebounce";
import { STORAGE_KEYS, useLocalStorage } from "./hooks/useLocalStorage";
import { usePlaceSearch } from "./hooks/usePlaceSearch";
import {
  CATEGORY_LABELS,
  DEFAULT_SORT,
  type CategoryFilter as CategoryFilterValue,
  type SortKey,
} from "./types/place";

/** 최근 검색어 최대 보관 개수. */
const MAX_RECENT = 5;

/** 검색 결과 스켈레톤(로딩) 카드 1장. */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded bg-surface-sunken" />
          <div className="h-3 w-1/3 rounded bg-surface-sunken" />
        </div>
        <div className="h-9 w-9 rounded-full bg-surface-sunken" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-surface-sunken" />
        <div className="h-3 w-4/5 rounded bg-surface-sunken" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 rounded-chip bg-surface-sunken" />
        <div className="h-6 w-12 rounded-chip bg-surface-sunken" />
      </div>
    </div>
  );
}

function App() {
  // ── 검색어: 입력값(raw) → 디바운스 → 확정 검색어 ──────────────────
  const [rawQuery, setRawQuery] = useState("");
  const debouncedQuery = useDebounce(rawQuery, 300);

  // ── 필터/정렬 상태 ─────────────────────────────────────────────
  const [category, setCategory] = useState<CategoryFilterValue>("all");
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // ── 에러 상태 시연 토글(simulateError 트리거) ──────────────────
  const [simulateError, setSimulateError] = useState(false);

  // ── 영속 상태: 최근 검색어 / 즐겨찾기 id ───────────────────────
  const [recent, setRecent] = useLocalStorage<string[]>(
    STORAGE_KEYS.RECENT_QUERIES,
    [],
  );
  const [favoriteIds, setFavoriteIds] = useLocalStorage<number[]>(
    STORAGE_KEYS.FAVORITE_IDS,
    [],
  );

  // ── 핵심 훅: 입력 객체 전달, 반환 키를 그대로 소비 ────────────
  const { results, isLoading, isError, error, refetch, total, totalAll } =
    usePlaceSearch({
      query: debouncedQuery,
      category,
      sort,
      favoritesOnly,
      favoriteIds,
      simulateError,
    });

  // 즐겨찾기 빠른 조회용 Set.
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  // ── 검색 확정 시(비어있지 않은 debouncedQuery) 최근 검색어 추가 ─
  //    최대 5개, 중복 제거, 최신 우선.
  useEffect(() => {
    const term = debouncedQuery.trim();
    if (term === "") return;
    setRecent((prev) => {
      const next = [term, ...prev.filter((t) => t !== term)];
      return next.slice(0, MAX_RECENT);
    });
  }, [debouncedQuery, setRecent]);

  // ── 즐겨찾기 토글 → useLocalStorage(FAVORITE_IDS) 갱신 ─────────
  const handleToggleFavorite = useCallback(
    (id: number) => {
      setFavoriteIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [setFavoriteIds],
  );

  // ── 최근 검색어 칩 동작 ────────────────────────────────────────
  const handleSearchAgain = useCallback((term: string) => {
    setRawQuery(term);
  }, []);

  const handleRemoveRecent = useCallback(
    (term: string) => {
      setRecent((prev) => prev.filter((t) => t !== term));
    },
    [setRecent],
  );

  const handleClearRecent = useCallback(() => {
    setRecent([]);
  }, [setRecent]);

  // 결과 카운트 표시 문구.
  const countLabel = useMemo(() => {
    if (isLoading || isError) return null;
    const scope = category === "all" ? "" : ` · ${CATEGORY_LABELS[category]}`;
    return `${total}곳${scope}`;
  }, [isLoading, isError, total, category]);

  return (
    <div className="min-h-screen bg-surface-muted">
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-16 pt-8">
        {/* 헤더 */}
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-ink">동네 검색</h1>
          <p className="text-caption text-ink-muted">
            가까운 음식점·카페·공원·병원·생활편의를 검색해보세요
          </p>
        </header>

        {/* 검색창 */}
        <SearchBar value={rawQuery} onChange={setRawQuery} />

        {/* 필터 + 정렬 + 즐겨찾기만 보기 */}
        <div className="flex flex-col gap-3">
          <CategoryFilter value={category} onChange={setCategory} />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              aria-pressed={favoritesOnly}
              className={[
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-chip px-3.5 text-caption font-medium",
                "border transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                favoritesOnly
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-ink-secondary hover:border-border-strong",
              ].join(" ")}
            >
              <span aria-hidden="true">{favoritesOnly ? "♥" : "♡"}</span>
              즐겨찾기만
            </button>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        {/* 최근 검색어 */}
        <RecentSearches
          items={recent}
          onSearchAgain={handleSearchAgain}
          onRemove={handleRemoveRecent}
          onClearAll={handleClearRecent}
        />

        {/* 결과 영역: loading / error / success 3상태 분기 */}
        <section aria-label="검색 결과" className="flex flex-col gap-3">
          {/* 결과 카운트 + 에러 시연 토글 */}
          <div className="flex items-center justify-between">
            <span className="text-caption text-ink-muted">
              {countLabel ?? " "}
            </span>
            <label className="flex cursor-pointer items-center gap-1.5 text-caption text-ink-muted">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="accent-primary"
              />
              에러 시연
            </label>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface px-6 py-12 text-center shadow-card"
            >
              <div
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-2xl text-primary"
              >
                !
              </div>
              <div className="space-y-1">
                <p className="text-body font-semibold text-ink">
                  결과를 불러오지 못했어요
                </p>
                <p className="text-caption text-ink-muted">
                  {error?.message ?? "잠시 후 다시 시도해주세요."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  // 에러 시연 중이라면 끄고 재시도해야 성공 상태를 볼 수 있다.
                  setSimulateError(false);
                  refetch();
                }}
                className="h-10 rounded-chip bg-primary px-5 text-body font-medium text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                다시 시도
              </button>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              message={
                totalAll > 0
                  ? undefined
                  : "표시할 장소가 없습니다."
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {results.map((place) => (
                <li key={place.id}>
                  <PlaceCard
                    place={place}
                    query={debouncedQuery}
                    isFavorite={favoriteSet.has(place.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
