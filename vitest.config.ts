import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// 순수 함수 단위 테스트용 설정.
// JSX(highlightText.tsx 등) 변환을 위해 react 플러그인을 사용하고,
// DOM이 필요 없는 테스트라 node 환경에서 실행한다.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
