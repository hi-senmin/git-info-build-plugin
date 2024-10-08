一个构建plugin插件，在 build 的时候自动在 index.html 中插入当前构建 git HEAD 节点的相关信息，以供排查构建版本


### install

```bash
npm i git-info-build-plugin -D
```


### 引入

```js
import { vitePluginGitInfoInject } from 'git-info-build-plugin';
// or

const { WebpackPluginGitInfoInject } = require('git-info-build-plugin');
// const { WebpackPluginGitInfoInject3 } = require('git-info-build-plugin');
```


-   WebpackPluginGitInfoInject
  webpack 4/5+ 构建环境引入

-   Webpack3PluginGitInfoInject
  webpack 3- 构建环境引入

-   vitePluginGitInfoInject
  vite 构建环境引入


- options

```json
  {
    "hash": true,
    "time": true,
    "branch": true,
    "tag": true,
    "console": true,
    "htmlFile": "index.html",
    "globalVarName": "__PROJECT_VERSION_INFO__",

    "outFile": "", // _version.txt 默认不输出
    "buildTime": true,
  }
```

在插入的信息中是否需要的相关信息：

- hash  提交节点的hash串
- time  提交节点的时间
- branch 分支信息，如果有
- tag  HEAD 节点上有的tag信息
- htmlFile 插入的html文件信息
- globalVarName  插件html中的全局变量名,可为空
- console  是否控制台输出

- outFile 在build dist文件夹中输入一个文件，为空则不输出
- buildTime  构建时间点


### 示例
```js
// vite.config.js
import vue2 from '@vitejs/plugin-vue2';
import { vitePluginGitInfoInject } from 'git-info-build-plugin';

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
const { WebpackPluginGitInfoInject, /* Webpack3PluginGitInfoInject */ } = require('git-info-build-plugin');

module.exports = {
  // ...
  configureWebpack: (config) => {
    config.plugins.push(...[new WebpackPluginGitInfoInject(options)]);
  },
```


### 默认输出

- console 控制台 输出日志

```
[git-info] {
    "commitHash": "xxxxxxxxxxxxxxxxxxxx",
    "commitTime": "2024-08-15 14:50:13",
    "gitBranch": "xxx-xxx",
    "gitTag": "xx-xx",
    "buildTime": "2024/8/15 5:34:30"
}
```

- html文件新增脚本

```
<script>window.__PROJECT_VERSION_INFO__ = {"commitHash":"xxxxxxxxxxxxxxxxxxxx","commitTime":"2024-08-15 14:50:13","gitBranch":"xxx-xxx","gitTag":"xx-xx"};console.info("[git-info] ", window.__PROJECT_VERSION_INFO__);</script>
```

- 带有 outFile 则会在对应dist文件夹内新建一个 文件内容，内容和上述一致