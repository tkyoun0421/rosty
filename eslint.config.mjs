import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

const restrictedImports = [
  {
    name: "#app",
    message: "`#app` can only be imported from the app layer.",
  },
  {
    name: "#flows",
    message: "`#flows` can only be imported from app or flows.",
  },
  {
    name: "#mutations",
    message: "`#mutations` can only be imported from app, flows, or mutations.",
  },
  {
    name: "#queries",
    message: "`#queries` can only be imported from app, flows, mutations, or queries.",
  },
];

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["#app", "#app/*"],
              message: "`#app/*` is reserved for route-layer files.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/flows/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: restrictedImports.slice(0, 2),
        },
      ],
    },
  },
  {
    files: ["src/mutations/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: restrictedImports.slice(0, 3),
        },
      ],
    },
  },
  {
    files: ["src/queries/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: restrictedImports,
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: restrictedImports,
          patterns: [
            {
              group: ["#app/*", "#flows/*", "#mutations/*", "#queries/*"],
              message: "`shared` cannot import from higher layers.",
            },
          ],
        },
      ],
    },
  },
);
