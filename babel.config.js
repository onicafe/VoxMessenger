module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@core': './src/core',
            '@modules': './src/modules',
            '@ui': './src/ui',
            '@tools': './src/tools',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
