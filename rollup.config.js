import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: './src/index.js',
  output: {
    file: './dist/vue.js',
    name: 'Vue', // 给你全局添加一个全局属性
    format: 'umd', // esm  commonjs模块 iife自执行函数  umd(commonjs amd)
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    resolve()
  ]
}