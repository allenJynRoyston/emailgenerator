const merge = require('webpack-merge');
const common = require('./webpack.common.js');

console.log('Webpack: development')

module.exports = env => merge(common, {
  mode: 'development',
});