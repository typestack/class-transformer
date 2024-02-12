import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'build/esm5/index.js',
  output: [
    {
      name: 'ClassTransformer',
      format: 'umd',
      file: 'build/bundles/class-transform.umd.js',
      sourcemap: true,
    },
    {
      name: 'ClassTransformer',
      format: 'umd',
      file: 'build/bundles/class-transform.umd.min.js',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [commonjs(), nodeResolve()],
};
