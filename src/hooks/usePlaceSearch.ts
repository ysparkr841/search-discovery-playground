import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchPlaces } from "../api/placesApi";
import type { Place, PlaceSearchParams } from "../types/place";
import { sortPlaces } from "../utils/sortPlaces";

/**
 * usePlaceSearch 입력 파라미터.
 *
 * {@link PlaceSearchParams}(query/category/sort/favoritesOnly)에 더해,
 * 즐겨찾기 필터링과 에러 시연에 필요한 값을 받는다.
 */
export interface UsePlaceSearchParams extends PlaceSearchParams {
  /** 즐겨찾기한 장소 id 목록. `favoritesOnly`가 true일 때 필터 기준이 된다. */
  favoriteIds: number[];
  /** true면 Mock API가 의도적으로 에러를 던진다(error 상태 시연용). 기본 false. */
  simulateError?: boolean;
}

/** usePlaceSearch 반환 shape. App.tsx 소비 코드와 키 이름이 정확히 일치해야 한다. */
export interface UsePlaceSearchResult {
  /** 필터·정렬이 모두 적용된 최종 장소 목록. */
  results: Place[];
  /** 최초 로딩 여부(데이터가 아직 없음). */
  isLoading: boolean;
  /** 에러 상태 여부. */
  isError: boolean;
  /** 에러 객체(없으면 null). */
  error: Error | null;
  /** 쿼리 재요청 함수. */
  refetch: () => void;
  /** 필터·정렬 적용 후 결과 개수(= results.length). */
  total: number;
  /** 서버에서 받은 전체 장소 개수(필터 적용 전). */
  totalAll: number;
}

/**
 * 검색 결과를 도출하는 핵심 훅.
 *
 * Mock API(`fetchPlaces`)를 TanStack Query로 호출해 전체 장소를 받은 뒤,
 * 클라이언트에서 검색어·카테고리·즐겨찾기 필터와 정렬을 **파생 계산**한다.
 * (파생 상태는 저장하지 않고 useMemo로 메모이즈한다.)
 *
 * 규약:
 * - 빈 검색어(`query` 트림 후 "") → 검색어 필터 미적용(전체).
 * - 카테고리 `"all"` → 카테고리 필터 미적용.
 * - `favoritesOnly`가 true면 `favoriteIds`에 포함된 장소만.
 * - 검색어 매칭은 `name`/`description`/`tags`를 대소문자 무시로 부분 일치.
 * - 정렬은 {@link sortPlaces}에 위임.
 */
export function usePlaceSearch(params: UsePlaceSearchParams): UsePlaceSearchResult {
  const {
    query,
    category,
    sort,
    favoritesOnly,
    favoriteIds,
    simulateError = false,
  } = params;

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<Place[], Error>({
    queryKey: ["places", { simulateError }],
    queryFn: () => fetchPlaces({ simulateError }),
  });

  // 즐겨찾기 조회를 O(1)로 만들기 위한 Set. favoriteIds 변경 시에만 재생성.
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const results = useMemo<Place[]>(() => {
    const all = data ?? [];
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = all.filter((place) => {
      // 카테고리 필터: "all" 이면 미적용.
      if (category !== "all" && place.category !== category) {
        return false;
      }
      // 즐겨찾기 필터.
      if (favoritesOnly && !favoriteSet.has(place.id)) {
        return false;
      }
      // 검색어 필터: 빈 쿼리면 미적용.
      if (normalizedQuery !== "") {
        const haystack = [
          place.name,
          place.description,
          ...place.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }
      return true;
    });

    return sortPlaces(filtered, sort);
  }, [data, query, category, favoritesOnly, favoriteSet, sort]);

  return {
    results,
    isLoading: isPending,
    isError,
    error: error ?? null,
    refetch: () => {
      void refetch();
    },
    total: results.length,
    totalAll: data?.length ?? 0,
  };
}
