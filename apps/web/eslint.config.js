import eslintPluginReact from "@eslint-react/eslint-plugin";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: new URL(".", import.meta.url).pathname,
      },
    },
    plugins: {
      "react-hooks": eslintPluginReactHooks,
      "@eslint-react": eslintPluginReact,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  }
);
