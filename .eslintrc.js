// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  ignorePatterns: [
    "/dist/*",
    "/android/*",
    "/app-example/*",
    "/node_modules/*",
    ".expo/*",
    ".idea/*",
    ".vscode/*"
  ],
  "overrides": [
    {
      "files": [
        "**/*.test.*"
      ],
      "env": {
        "jest": true
      }
    }
  ]
};
