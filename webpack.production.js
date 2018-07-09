const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

console.log('Webpack: production')

module.exports = env => merge(common, {
  mode: 'production',
  plugins: [
    new UglifyJSPlugin()
  ]  
});