import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    js.configs.recommended,
    {
        plugins: {
            "unused-imports": unusedImports,
        },
        languageOptions: {
            globals: {
                console: "readonly",
                process: "readonly",
                __dirname: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "readonly"
            },
            ecmaVersion: 2022,
            sourceType: "module"
        },
        rules: {
            "no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
            ]
        }
    }
];
