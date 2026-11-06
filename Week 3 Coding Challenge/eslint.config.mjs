import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The wall rule: business rules stay free of screens, data and outside services.
  {
    files: ["src/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/*",
                "!@/domain",
                "!@/domain/*",
                "../*",
                "next",
                "next/*",
                "react",
                "react-dom",
                "@mui/*",
                "@emotion/*",
                "@supabase/*",
                "@anthropic-ai/*",
              ],
              message: "src/domain must not import from other folders.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
