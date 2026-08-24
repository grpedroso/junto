const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// spike-notif is a second Expo project inside the repo. Without this, Metro
// finds two package.json files and two copies of react-native, and the app
// bundle breaks.
config.resolver.blockList = [new RegExp(`^${path.resolve(__dirname, 'spike-notif').replace(/[\\]/g, '\\\\')}\\.*`)];

module.exports = withNativeWind(config, { input: './global.css' });
