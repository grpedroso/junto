// This spike is a second Expo project inside Junto's repo, and Metro searches
// upward for its config: without this file it finds the app's
// `metro.config.js`, runs the app's NativeWind setup here, and then fails
// looking for a `tailwind.config` this folder does not have.
//
// The root config blocks this folder from the app's bundle. This one blocks the
// other direction.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
