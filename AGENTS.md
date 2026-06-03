# AGENTS.md

This document provides guidelines for agents working in this repository.

## Project Overview

A Node.js build plugin for Webpack and Vite that injects Git commit information (hash, branch, tag, build time) into HTML during builds. The source is in `core/index.cjs`, built with Rollup to `index.js`.

## Commands

### Build

```bash
npm run build
```

Builds the project using Rollup. Output goes to `index.js`.

### Release

```bash
npm run release
```

Runs `bin/deploy.js` to publish to npm. Supports `version=x.y.z` argument.

### Lint

```bash
npx eslint .
```

No dedicated npm script exists; use npx directly.

### Format

```bash
npx prettier --write .
```

Formats all JavaScript files.

### Test

```bash
npm test
```

Currently exits with error (no tests configured). No test framework is set up.

## Code Style

### General Rules

- This project uses **ESLint** (airbnb-base + prettier plugin) and **Prettier**
- All code should pass `npx eslint .` before committing
- Run `npx prettier --write .` before committing

### Prettier Configuration (.prettierrc.js)

| Option         | Value     |
| -------------- | --------- |
| printWidth     | 100       |
| tabWidth       | 2         |
| useTabs        | false     |
| semi           | true      |
| singleQuote    | true      |
| quoteProps     | as-needed |
| trailingComma  | all       |
| bracketSpacing | true      |
| arrowParens    | always    |
| endOfLine      | auto      |

### ESLint Configuration (.eslintrc.js)

- Extends: `airbnb-base`, `plugin:prettier/recommended`
- ECMAScript 2021, ES modules
- Single quotes, trailing commas enforced via Prettier

## Naming Conventions

| Type             | Convention         | Example                      |
| ---------------- | ------------------ | ---------------------------- |
| Classes          | PascalCase         | `WebpackPluginGitInfoInject` |
| Functions        | camelCase          | `getGitBranchAndCommit`      |
| Variables        | camelCase          | `commitHash`, `outputDir`    |
| Plugin functions | camelCase + suffix | `vitePluginGitInfoInject`    |
| Constants        | UPPER_SNAKE_CASE   | (none currently)             |

## File Structure

```
.
├── core/
│   └── index.cjs         # Source code (edit here)
├── index.js              # Built output (do not edit)
├── index.d.ts            # TypeScript definitions
├── bin/
│   └── deploy.js         # Release script
├── rollup.config.mjs     # Build configuration
├── .eslintrc.js          # Lint config
├── .prettierrc.js        # Format config
└── package.json
```

## Important Notes

### Adding New Features

1. Edit `core/index.cjs` (source file)
2. Run `npm run build` to generate `index.js`
3. Run `npx eslint .` to check for errors
4. Run `npx prettier --write .` to format

### Error Handling Pattern

```javascript
try {
  // git commands
} catch (error) {
  console.error('\n\n\nFailed to retrieve Git branch and commit:');
  return null;
}
```

- Use `try/catch` for git execSync calls
- Log errors with `console.error()`
- Return `null` rather than throwing on failure

### Plugin Patterns

**Vite Plugin** (function returning object):

```javascript
function vitePluginGitInfoInject(options = {}) {
  return {
    name: 'vite-plugin-git-info-inject',
    configResolved(resolvedConfig) { ... },
    transformIndexHtml(html) { ... },
    closeBundle() { ... },
  };
}
```

**Webpack Plugin** (class with apply method):

```javascript
class WebpackPluginGitInfoInject {
  constructor(options = {}) { ... }
  apply(compiler) {
    compiler.hooks.emit.tapAsync('name', (compilation, callback) => { ... });
  }
}
```

### Git Dependencies

This plugin runs `git` commands via `execSync`. Ensure:

- Git is installed and in PATH
- Commands run in correct working directory
- Errors are handled gracefully when git repo is not available

## TypeScript

Type definitions are in `index.d.ts`. Update this file when changing the plugin API.

## Dependencies

- Runtime: `child_process`, `fs`, `path` (Node.js built-ins)
- Dev: rollup, eslint, prettier, @rollup/plugin-node-resolve, @rollup/plugin-terser
