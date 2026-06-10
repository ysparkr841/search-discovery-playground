/**
 * PlaceCard — 검색 결과 단일 장소 카드.
 *
 * 순수 컴포넌트. Place 데이터·검색어(하이라이팅용)·즐겨찾기 상태/콜백을 props로 받는다.
 * 장소명 하이라이팅은 logic-engineer의 `highlightText(text, query)`를 사용한다(자체 구현 금지).
 *
 * 표시: 장소명(하이라이팅) · 카테고리(한글) · 설명 · 거리(m/km) · 평점(★) ·
 *       업데이트일시 · 태그칩 · FavoriteToggle.
 */
import { CATEGORY_LABELS, type Place } from "../types/place";
import { highlightText } from "../utils/highlightText";
import FavoriteToggle from "./FavoriteToggle";

export interface PlaceCardProps {
  /** 표시할 장소 데이터. */
  place: Place;
  /** 하이라이팅에 사용할 현재 검색어(빈 문자열이면 강조 없음). */
  query: string;
  /** 즐겨찾기 여부. */
  isFavorite: boolean;
  /** 즐겨찾기 토글 시 place.id와 함께 호출. */
  onToggleFavorite: (id: number) => void;
}

/** 거리(meter)를 사람이 읽기 좋은 문자열로. 1000m 미만은 m, 이상은 km. */
function formatDistance(meter: number): string {
  if (meter < 1000) return `${Math.round(meter)}m`;
  const km = meter / 1000;
  // 10km 미만은 소수 1자리, 이상은 정수
  return km < 10 ? `${km.toFixed(1)}km` : `${Math.round(km)}km`;
}

/** ISO 8601 → "YYYY.MM.DD" (로케일 비의존, 안정적 표기). */
function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function PlaceCard({
  place,
  query,
  isFavorite,
  onToggleFavorite,
}: PlaceCardProps) {
  const { id, name, category, description, distance, rating, updatedAt, tags } = place;

  return (
    <article
      className={[
        "rounded-card-lg border border-border bg-surface p-4 sm:p-5",
        "shadow-card transition-shadow hover:shadow-card-hover",
      ].join(" ")}
    >
      {/* 헤더: 카테고리 배지 + 즐겨찾기 */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="inline-flex items-center rounded-chip bg-primary-soft px-2.5 py-1 text-caption font-medium text-primary">
          {CATEGORY_LABELS[category]}
        </span>
        <FavoriteToggle
          active={isFavorite}
          onToggle={() => onToggleFavorite(id)}
          label={name}
        />
      </div>

      {/* 장소명 (하이라이팅) */}
      <h3 className="text-title font-bold text-ink">{highlightText(name, query)}</h3>

      {/* 설명 */}
      <p className="mt-1 line-clamp-2 text-body text-ink-secondary">
        {highlightText(description, query)}
      </p>

      {/* 메타: 평점 · 거리 · 업데이트일시 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
        <span className="inline-flex items-center gap-1 font-medium text-ink-secondary">
          <svg
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="currentColor"
            className="text-star"
            aria-hidden="true"
          >
            <path d="M12 2l2.9 6.26 6.6.62-4.95 4.5 1.45 6.62L12 17.27 5.99 20.5l1.45-6.62L2.49 8.88l6.6-.62L12 2z" />
          </svg>
          <span aria-label={`평점 ${rating.toFixed(1)}점`}>{rating.toFixed(1)}</span>
        </span>
        <span aria-hidden="true">·</span>
        <span aria-label={`거리 ${formatDistance(distance)}`}>
          {formatDistance(distance)}
        </span>
        <span aria-hidden="true">·</span>
        <span>업데이트 {formatUpdatedAt(updatedAt)}</span>
      </div>

      {/* 태그칩 */}
      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-chip bg-surface-muted px-2.5 py-1 text-caption text-ink-secondary"
            >
              #{highlightText(tag, query)}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
