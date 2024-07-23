### plugins

-   WebpackPluginGitInfoInject
  webpack4/5+ 构建环境引入

-   Webpack3PluginGitInfoInject
  webpack3- 构建环境引入

-   vitePluginGitInfoInject
  vite构建环境引入

构建工具，在build之后在index.html中插入当前构建git HEAD节点的相关信息

- options
```json
  {
    "hash": true,
    "time": true,
    "branch": true,
    "tag": true,
    htmlFile: 'index.html',
    globalVarName: '__PROJECT_VERSION_INFO__',
  };
```


```bash
npm i @fzs/mocp-tools -D
```

```js
// vite.config.js
import vue2 from '@vitejs/plugin-vue2';
import { vitePluginGitInfoInject } from '@fzs/mocp-tools/lib/plugins';

export default defineConfig({
  base: './',
  plugins: [
    vue2(),
    vitePluginGitInfoInject(options),
  ],
})
```


```js
// vue.config.js / webpack.config.js
const { WebpackPluginGitInfoInject, /* Webpack3PluginGitInfoInject */ } = require('@fzs/mocp-tools/lib/plugins');

module.exports = {
  // ...
  configureWebpack: (config) => {
    config.plugins.push(...[new WebpackPluginGitInfoInject(options)]);
  },
```