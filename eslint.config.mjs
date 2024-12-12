import typescriptEslint from "@typescript-eslint/eslint-plugin";
import parser from "vue-eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { includeIgnoreFile } from "@eslint/compat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default [...compat.extends("eslint:recommended", "prettier"), 
    includeIgnoreFile(gitignorePath),{
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "script",
    },
    ignores:[
        "eslint.config.mjs",
        "postcss.config.js",
        "tailwind.config.js",
        "*.cy.ts"
    ],
    rules: {
        "no-console": "error",
        "no-debugger": "error",

        "padding-line-between-statements": ["error", {
            blankLine: "always",

            prev: [
                "block",
                "block-like",
                "cjs-export",
                "class",
                "export",
                "import",
                "multiline-block-like",
                "multiline-const",
                "multiline-expression",
                "multiline-let",
                "multiline-var",
            ],

            next: "*",
        }, {
            blankLine: "always",
            prev: ["const", "let"],
            next: ["block", "block-like", "cjs-export", "class", "export", "import"],
        }, {
            blankLine: "always",
            prev: "*",

            next: [
                "multiline-block-like",
                "multiline-const",
                "multiline-expression",
                "multiline-let",
                "multiline-var",
            ],
        }, {
            blankLine: "any",
            prev: ["export", "import"],
            next: ["export", "import"],
        }],

        "lines-between-class-members": ["error", "always", {
            exceptAfterSingleLine: true,
        }],

        "no-nested-ternary": "error",
        curly: ["error", "multi-line"],
    },
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "plugin:cypress/recommended",
    "prettier",
).map(config => ({
    ...config,
    files: ["cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}", "**/*.ts", "**/*.vue"],
})), {
    files: ["cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}", "**/*.ts", "**/*.vue"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: parser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            parser: "@typescript-eslint/parser",
        },
    },

    rules: {
        "constructor-super": "off",
        "getter-return": "off",
        "no-const-assign": "off",
        "no-dupe-args": "off",
        "no-dupe-class-members": "off",
        "no-dupe-keys": "off",
        "no-func-assign": "off",
        "no-import-assign": "off",
        "no-new-symbol": "off",
        "no-new-native-nonconstructor": "off",
        "no-obj-calls": "off",
        "no-redeclare": "off",
        "no-setter-return": "off",
        "no-this-before-super": "off",
        "no-undef": "off",
        "no-unreachable": "off",
        "no-unsafe-negation": "off",
        "no-var": "error",
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
        }],

        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "no-console": "warn",

        "vue/component-tags-order": ["error", {
            order: ["script", "template", "style"],
        }],

        "vue/padding-line-between-blocks": "error",
        "vue/multi-word-component-names": "off",
        "vue/require-default-prop": "off",
        "vue/prefer-true-attribute-shorthand": "error",
        "vue/require-explicit-emits": "error",
    },
}];