import stylistic from "@stylistic/eslint-plugin"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import { defineConfig, globalIgnores } from "eslint/config"

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
    {
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "@stylistic/quotes": ["warn", "double"],
            "react/react-in-jsx-scope": "off",
            "@stylistic/jsx-self-closing-comp": [
                "error",
                { component: true, html: true },
            ],
        },
    },
])

export default eslintConfig
