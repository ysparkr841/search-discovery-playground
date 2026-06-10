/**
 * 검색 도메인의 핵심 타입 정의.
 *
 * 이 파일은 팀 전체(logic-engineer, ui-builder, integrator, qa-inspector)가
 * import 하는 **단일 데이터 계약(contract)** 이다. 여기서 export 하는 타입과
 * 상수가 곧 진실의 출처이며, 다른 모듈은 임의의 shape/라벨을 만들지 않는다.
 */

/** 장소 카테고리 영문 코드 (서버/데이터 모델 기준). */
export type PlaceCategory = "restaurant" | "cafe" | "park" | "hospital" | "life";

/** 단일 장소 항목. 시드 데이터(`src/data/places.ts`)와 Mock API의 반환 단위. */
export interface Place {
  /** 고유 식별자. */
  id: number;
  /** 장소명. 하이라이팅 대상이 되는 주 텍스트. */
  name: string;
  /** 카테고리 영문 코드. */
  category: PlaceCategory;
  /** 한 줄 설명. */
  description: string;
  /** 현재 위치 기준 거리(meter). 거리순 정렬에 사용. */
  distance: number;
  /** 평점(0~5, 소수 1자리). 평점순 정렬에 사용. */
  rating: number;
  /** 최근 업데이트 일시(ISO 8601). 최신순 정렬에 사용. */
  updatedAt: string;
  /** 태그 목록. 검색/하이라이팅 보조 텍스트로 활용 가능. */
  tags: string[];
}

/**
 * 정렬 키.
 * - `accuracy`  : 정확도순 (검색어 관련도 기반. 기본값)
 * - `latest`    : 최신순 (updatedAt 내림차순)
 * - `distance`  : 거리순 (distance 오름차순)
 * - `rating`    : 평점순 (rating 내림차순)
 */
export type SortKey = "accuracy" | "latest" | "distance" | "rating";

/**
 * 카테고리 필터 값. 실제 카테고리에 "전체"를 의미하는 `all`을 더한 합집합.
 * UI의 카테고리 탭/필터가 다루는 값이다.
 */
export type CategoryFilter = PlaceCategory | "all";

/**
 * 검색 파라미터. usePlaceSearch 등 클라이언트 측 파생 상태 계산의 입력.
 * (Mock API는 검색어를 받지 않고 전체 데이터를 반환하므로, 이 타입은
 *  클라이언트 필터/정렬 계층의 계약이다.)
 */
export interface PlaceSearchParams {
  /** 검색어(디바운스 후 확정값). 빈 문자열이면 전체. */
  query: string;
  /** 카테고리 필터. */
  category: CategoryFilter;
  /** 정렬 키. */
  sort: SortKey;
  /** 즐겨찾기만 보기 여부. */
  favoritesOnly: boolean;
}

/* ------------------------------------------------------------------ *
 * 라벨 매핑 — 영문 코드 ↔ 한글 표시명의 단일 출처.
 * UI는 반드시 아래 상수를 통해 라벨을 얻는다 (하드코딩 금지).
 * ------------------------------------------------------------------ */

/** 카테고리 필터(전체 포함) → 한글 라벨. */
export const CATEGORY_LABELS: Readonly<Record<CategoryFilter, string>> = {
  all: "전체",
  restaurant: "음식점",
  cafe: "카페",
  park: "공원",
  hospital: "병원",
  life: "생활편의",
};

/**
 * 카테고리 필터 표시 순서 (UI 탭 렌더 순서의 단일 출처).
 * "전체"가 항상 맨 앞.
 */
export const CATEGORY_FILTER_ORDER: readonly CategoryFilter[] = [
  "all",
  "restaurant",
  "cafe",
  "park",
  "hospital",
  "life",
];

/** 정렬 키 → 한글 라벨. */
export const SORT_LABELS: Readonly<Record<SortKey, string>> = {
  accuracy: "정확도순",
  latest: "최신순",
  distance: "거리순",
  rating: "평점순",
};

/** 정렬 옵션 표시 순서 (SortSelect 렌더 순서의 단일 출처). */
export const SORT_ORDER: readonly SortKey[] = [
  "accuracy",
  "latest",
  "distance",
  "rating",
];

/** 정렬 기본값. */
export const DEFAULT_SORT: SortKey = "accuracy";
