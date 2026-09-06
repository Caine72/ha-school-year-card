import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: { file: "dist/ha-school-year-card.js", format: "es", sourcemap: false },
  plugins: [nodeResolve(), commonjs(), typescript({ tsconfig: "./tsconfig.build.json" }), terser()],
};
