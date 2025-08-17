const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('metro-config').ConfigT} */
const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so changes in packages are picked up
config.watchFolders = [workspaceRoot];

// Enable resolving symlinks created by pnpm/workspaces
config.resolver.unstable_enableSymlinks = true;

// Resolve node_modules from both the app and the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
