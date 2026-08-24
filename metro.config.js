const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// spike-notif e um segundo projeto Expo dentro do repo. Sem isto o Metro acha
// dois package.json e duas copias de react-native, e o bundle do app quebra.
config.resolver.blockList = [new RegExp(`^${path.resolve(__dirname, 'spike-notif').replace(/[\\]/g, '\\\\')}\\.*`)];

module.exports = withNativeWind(config, { input: './global.css' });
