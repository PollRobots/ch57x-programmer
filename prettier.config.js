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
    "^@model(/.*)$",
    "^@ux(/.*)$",
    "",
    "^[.]",
    ".css$",
  ],
  importOrderTypeScriptVersion: "5.0.2",
  importOrderCaseSensitive: false,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};
