import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextConfig = compat.extends("next/core-web-vitals");

// Create a custom config to override specific rules
const customConfig = [
  {
    rules: {
      // Change no-unescaped-entities from error to warning
      "react/no-unescaped-entities": "warn",

      // Change react-hooks/exhaustive-deps from error to warning
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

// Combine the Next.js config with our custom overrides
const eslintConfig = [...nextConfig, ...customConfig];

export default eslintConfig;