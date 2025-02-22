module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "linebreak-style": ["error", "unix"],
    semi: ["error", "always"],
    "no-unused-vars": "off",
    "import/prefer-default-export": 0,
    "no-plusplus": 0,
    "no-underscore-dangle": 0,
    "prefer-template": 0,
    "no-await-in-loop": 0,
    "no-restricted-syntax": 0,
    "consistent-return": 0,
    "no-lonely-if": 0,
    "no-use-before-define": 0,
    "no-nested-ternary": 0,
    "import/no-cycle": 0,
    "no-multi-assign": 0,
    "guard-for-in": 0,
    "no-continue": 0,
    "lines-between-class-members": 0,
    "prefer-destructuring": 0,
    "prettier/prettier": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/ban-types": [
      "error",
      {
        extendDefaults: true,
        types: {
          "{}": false
        }
      }
    ]
  }
};
