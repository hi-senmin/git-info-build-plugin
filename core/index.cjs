/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-underscore-dangle
function getOptions(op = {}) {
  return {
    hash: true,
    time: true,
    branch: true,
    tag: true,
    htmlFile: 'index.html',
    globalVarName: '__PROJECT_VERSION_INFO__',
    console: true,

    outFile: '', // _version.txt
    buildTime: true,
    ...op,
  };
}

function getGitBranchAndCommit({ hash, time, branch, tag, buildTime: bTime }) {
  try {
    const commitHash = hash ? execSync('git rev-parse HEAD').toString().trim() : undefined;
    const commitTime = time ? execSync(`git log -1 --format='%ci'`).toString().trim() : undefined;

    const gitBranch = branch
      ? execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
      : undefined;

    const gitTag = tag ? execSync('git tag --points-at HEAD').toString().trim() : undefined;
    const buildTime = bTime ? new Date().toLocaleString() : undefined;

    const data = JSON.stringify({
      commitHash,
      commitTime,
      gitBranch,
      gitTag,
      buildTime,
    });
    return data;
  } catch (error) {
    console.error('\n\n\nFailed to retrieve Git branch and commit:');
    return null; // 或者抛出一个错误
  }
}

function getScriptCode(globalVarName, info, console) {
  let content = ``;
  if (globalVarName) {
    content = `window.${globalVarName} = ${info};`;
  }
  if (console) {
    content += `console.info("[git-info] ", ${globalVarName ? `window.${globalVarName}` : info});`;
  }
  return content;
}

class WebpackPluginGitInfoInject {
  constructor(options = {}) {
    this.options = getOptions(options);
  }

  setInjectedHtml(compilation) {
    const { hash, time, branch, tag, htmlFile, globalVarName, console, outFile, buildTime } =
      this.options;
    // 找到并修改index.html文件
    const htmlContent = compilation.assets[htmlFile].source();

    const info = getGitBranchAndCommit({ hash, time, branch, tag, buildTime });

    const injectedHtml = `${htmlContent} <script>${getScriptCode(
      globalVarName,
      info,
      console,
    )}</script>`;
    // 更新assets中的index.html
    // eslint-disable-next-line no-param-reassign
    compilation.assets[htmlFile] = {
      source: () => injectedHtml,
      size: () => injectedHtml.length,
    };

    if (outFile) {
      // eslint-disable-next-line no-param-reassign
      compilation.assets[outFile] = {
        source: () => info,
        size: () => info.length,
      };
    }
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
  const { hash, time, branch, tag, globalVarName, console, outFile, buildTime } =
    getOptions(options);
  let outputDir; // 保存输出目录路径

  let info = '';
  let code = '';

  return {
    name: 'vite-plugin-git-info-inject',
    // 获取 Vite 配置
    configResolved(resolvedConfig) {
      // 获取输出目录和项目根路径
      outputDir = resolvedConfig.build.outDir;

      info = getGitBranchAndCommit({ hash, time, branch, tag, buildTime });
      code = getScriptCode(globalVarName, info, console);
    },

    transformIndexHtml(html) {
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
    closeBundle() {
      try {
        if (outFile) {
          const filePath = path.join(outputDir, outFile);
          fs.writeFileSync(filePath, info);
        }
      } catch (error) {
        console.error(error);
      }
    },
  };
}

module.exports = {
  vitePluginGitInfoInject, // 放后面会导致 vite4+ 报错！！
  WebpackPluginGitInfoInject,
  Webpack3PluginGitInfoInject,
};
