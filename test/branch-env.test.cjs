const assert = require('assert');

const { WebpackPluginGitInfoInject } = require('../index');

function renderBranch(env) {
  const previousEnv = {};
  Object.keys(env).forEach((key) => {
    previousEnv[key] = process.env[key];
    process.env[key] = env[key];
  });

  try {
    const plugin = new WebpackPluginGitInfoInject({
      hash: false,
      time: false,
      tag: false,
      buildTime: false,
      console: false,
    });

    const html = plugin.setInjectedHtml({
      assets: {
        'index.html': {
          source: () => '<html></html>',
        },
      },
    });

    const match = html.match(/window\.__PROJECT_VERSION_INFO__ = (.*?);<\/script>/);
    return JSON.parse(match[1]).gitBranch;
  } finally {
    Object.keys(env).forEach((key) => {
      if (previousEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previousEnv[key];
      }
    });
  }
}

assert.strictEqual(
  renderBranch({ BUILD_BRANCH: 'ci/test-branch-should-win' }),
  'ci/test-branch-should-win',
);

assert.strictEqual(renderBranch({ GIT_BRANCH: 'origin/dev-1.2.0' }), 'dev-1.2.0');

assert.strictEqual(renderBranch({ appVersion: 'release/dev-1.2.0' }), 'release/dev-1.2.0');
