const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Path aliases support — mirrors tsconfig.json paths
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@core': path.resolve(__dirname, 'src/core'),
  '@modules': path.resolve(__dirname, 'src/modules'),
  '@ui': path.resolve(__dirname, 'src/ui'),
  '@tools': path.resolve(__dirname, 'src/tools'),
};

module.exports = config;
