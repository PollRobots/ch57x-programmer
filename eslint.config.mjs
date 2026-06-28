import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tailwindcss from "eslint-plugin-tailwindcss";
import { config, configs } from "typescript-eslint";

export default config(
  {
    ignores: [
      "./dist/**/*",
      "./postcss.config.js",
      "./prettier.config.js",
      "./webpack.config.js",
    ],
  },
  js.configs.recommended,
  ...configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
      },
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      tailwindcss: tailwindcss,
    },
    settings: {
      react: {
        version: "detect",
      },
      tailwindcss: {
        callees: ["cva", "twJoin", "twMerge"],
        cssConfigPath: "./src/input.css",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...tailwindcss.configs.recommended.rules,

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "tailwindcss/classnames-order": "off",
    },
  }
);
