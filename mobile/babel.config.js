module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // ⚠ Le plugin worklets (Reanimated v4) DOIT rester le dernier de la liste.
    plugins: ['react-native-worklets/plugin'],
  };
};
