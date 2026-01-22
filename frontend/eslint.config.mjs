import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";
import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = tseslint.config(
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  // Global ignores
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "scripts/**",
      "storybook-static/**",
      "docs/**",
    ],
  },

  // React and Next.js
  {
    files: ["**/*.{ts,tsx}"],
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    plugins: {
      "react-hooks": reactHooks,
      "react-compiler": reactCompiler,
      "@next/next": nextPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react-compiler/react-compiler": "warn",
      // React Compiler memoization rules - warn for gradual migration
      "react-hooks/preserve-manual-memoization": "warn",
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [{ pattern: "@/**", group: "internal", position: "after" }],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  // FSD Architecture Rules - Global public API enforcement
  // NOTE: Set to "warn" for gradual migration. Change to "error" once migration complete
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            // Enforce public API for shared (allow @/shared, @/shared/server)
            {
              group: ["@/shared/*/*", "@/shared/**/*"],
              message:
                "Use public API: import from '@/shared' or '@/shared/server' instead of internal modules",
            },
            // Enforce public API for entities
            {
              group: ["@/entities/*/*", "@/entities/*/*/**"],
              message:
                "Use public API: import from '@/entities/<slice>' instead of internal modules",
            },
            // Enforce public API for features
            {
              group: ["@/features/*/*", "@/features/*/*/**"],
              message:
                "Use public API: import from '@/features/<slice>' instead of internal modules",
            },
            // Enforce public API for widgets
            {
              group: ["@/widgets/*/*", "@/widgets/*/*/**"],
              message:
                "Use public API: import from '@/widgets/<slice>' instead of internal modules",
            },
          ],
        },
      ],
    },
  },

  // Layer hierarchy: shared cannot import from upper layers
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/entities/*"],
              message: "shared layer cannot import from entities",
            },
            {
              group: ["@/features/*"],
              message: "shared layer cannot import from features",
            },
            {
              group: ["@/widgets/*"],
              message: "shared layer cannot import from widgets",
            },
          ],
        },
      ],
    },
  },

  // Layer hierarchy: entities cannot import from upper layers
  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/features/*"],
              message: "entities layer cannot import from features",
            },
            {
              group: ["@/widgets/*"],
              message: "entities layer cannot import from widgets",
            },
          ],
        },
      ],
    },
  },

  // Layer hierarchy: features cannot import from upper layers
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/widgets/*"],
              message: "features layer cannot import from widgets",
            },
          ],
        },
      ],
    },
  },

  // Test files - relaxed rules
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "e2e/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-imports": "off",
    },
  }
);

export default eslintConfig;
