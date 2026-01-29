const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  'glb',
  'gltf',
  'png',
  'jpg'
);

// Resolve "Multiple IDs" warning by forcing single three.js instance
config.resolver.extraNodeModules = {
  'three': require.resolve('three'),
};

module.exports = config;
