import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactRefresh.configs.vite,
    ],
    // eslint-plugin-react-hooks 7.x 의 "recommended-latest" 는 legacy
    // array-of-strings `plugins` 형식이라 ESLint 10 의 flat config 에서 거부된다.
    // 플러그인을 객체로 직접 등록하고 권장 룰을 명시적으로 켠다.
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
]);
