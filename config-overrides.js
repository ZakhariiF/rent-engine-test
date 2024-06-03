const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
    addWebpackAlias({
        buffer: require.resolve('buffer'),
        timers: require.resolve('timers-browserify'),
    })
);
