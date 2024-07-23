import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: {
    index: 'core/index.cjs',
  },
  output: {
    entryFileNames: '[name].js',
    dir: './',
    format: 'cjs', // 输出格式，这里选择ES模块，但实际上是ES5的代码
  },
  plugins: [
    resolve(),
    terser(), // 使用Terser压缩代码
  ],
};
