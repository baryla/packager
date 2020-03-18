import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const plugins = [resolve(), typescript(), cjs()];

if (process.env.NODE_ENV === "production") {
  plugins.push(
    terser({
      output: {
        comments: (n, c) => /@license/i.test(c.value)
      }
    })
  );
}

const baseOutputSettings = {
  name: "jsonPlugin",
  format: "iife",
  compact: true
};

const banner = `/*
    @license

    Packager JSON Plugin v${pkg.version}
    @author baryla (Adrian Barylski)
    @github https://github.com/baryla/packager

    Released under the MIT License.
*/`;

export default [
  {
    input: "src/index.ts",
    inlineDynamicImports: true,
    plugins,
    output: [
      {
        file: ".dist/index.js",
        format: "esm",
        banner,
        sourcemap: true
      }
    ]
  },
  {
    input: "src/index.browser.ts",
    plugins,
    output: [
      {
        ...baseOutputSettings,
        file: ".dist/index.browser.js",
        banner
      }
    ]
  }
];
