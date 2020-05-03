module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["wordpress", "plugin:prettier/recommended"],
  rules: {
    "no-var": "error",
    "space-in-parens": "off",
  },
};