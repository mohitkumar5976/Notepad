const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

let config = mergeConfig(getDefaultConfig(__dirname), {
  // Your custom config if needed
});

config = withNativeWind(config, { input: "./global.css" });
config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
