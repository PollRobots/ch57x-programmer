/** @type {import("pretter").Config} */
module.exports = {
  arrowParens: "avoid",
  trailingComma: "es5",
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "",
    "^@hooks/(.*)$",
    "^@model/(.*)$",
    "^@ux/(.*)$",
    "",
    "^[./]",
    "",
    "^.*\\.css$",
  ],
  importOrderTypeScriptVersion: "5.0.0",
  importOrderCaseSensitive: false,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};
