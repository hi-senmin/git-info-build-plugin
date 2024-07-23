/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { execSync } = require('child_process');

// eslint-disable-next-line no-underscore-dangle
function getOptions(op = {}) {
  return {
    hash: true,
    time: true,
    branch: true,
    tag: true,
    htmlFile: 'index.html',
    globalVarName: '__PROJECT_VERSION_INFO__',
    ...op,
  };
}

function getGitBranchAndCommit(hash, time, branch, tag) {
  try {
    const commitHash = hash ? execSync('git rev-parse HEAD').toString().trim() : undefined;
    const commitTime = time ? execSync(`git log -1 --format='%ci'`).toString().trim() : undefined;

    const gitBranch = branch
      ? execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
      : undefined;

    const gitTag = tag ? execSync('git tag --points-at HEAD').toString().trim() : undefined;

    const data = JSON.stringify({
      commitHash,
      commitTime,
      gitBranch,
      gitTag,
    });
    return data;
  } catch (error) {
    console.error('\n\n\nFailed to retrieve Git branch and commit:', error);
    return null; // 或者抛出一个错误
  }
}

function getScriptCode(globalVarName, info) {
  return `window.${globalVarName} = ${info}`;
}

class WebpackPluginGitInfoInject {
  constructor(options = {}) {
    this.options = getOptions(options);
  }

  setInjectedHtml(compilation) {
    const { hash, time, branch, tag, htmlFile, globalVarName } = this.options;
    // 找到并修改index.html文件
    const htmlContent = compilation.assets[htmlFile].source();

    const info = getGitBranchAndCommit(hash, time, branch, tag);

    const injectedHtml = `${htmlContent} <script>${getScriptCode(globalVarName, info)}</script>`;
    // 更新assets中的index.html
    // eslint-disable-next-line no-param-reassign
    compilation.assets['index.html'] = {
      source: () => injectedHtml,
      size: () => injectedHtml.length,
    };
    return injectedHtml;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('webpack-plugin-git-info-inject', (compilation, callback) => {
      try {
        this.setInjectedHtml(compilation);
      } catch (error) {
        console.error(error);
      }

      callback();
    });
  }
}

class Webpack3PluginGitInfoInject extends WebpackPluginGitInfoInject {
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      try {
        this.setInjectedHtml(compilation);
      } catch (error) {
        console.error(error);
      }
      callback();
    });
  }
}

function vitePluginGitInfoInject(options = {}) {
  const { hash, time, branch, tag, globalVarName } = getOptions(options);

  return {
    name: 'vite-plugin-git-info-inject',
    transformIndexHtml(html) {
      const info = getGitBranchAndCommit(hash, time, branch, tag);
      const code = getScriptCode(globalVarName, info);
      if (info) {
        return [
          {
            tag: 'script',
            children: code,
            injectTo: 'body',
          },
        ];
      }
      return html;
    },
  };
}

module.exports = {
  WebpackPluginGitInfoInject,
  Webpack3PluginGitInfoInject,
  vitePluginGitInfoInject,
};
