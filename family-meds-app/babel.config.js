module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Note: do NOT add react-native-reanimated/plugin here for SDK 54.
    // babel-preset-expo already includes the correct reanimated transforms.
    // Adding it manually causes a missing 'react-native-worklets/plugin' error.
  };
};
