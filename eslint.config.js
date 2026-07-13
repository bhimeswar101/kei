import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "node_modules",
  ]),

  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },

    rules: {
      // Disable TS default unused-vars (we use unused-imports instead)
      "@typescript-eslint/no-unused-vars": "off",

      // Remove unused imports
      "unused-imports/no-unused-imports": "error",

      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Keep imports organized
      "import/order": [
        "warn",
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always",
        },
      ],

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);