// Karma configuration
// Generated on Thu Jan 25 2018 15:08:53 GMT+0000 (GMT)
var webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      './test/*.spec.js'
    ],
    preprocessors: {
      './test/*.spec.js' : ['webpack']
    },
    webpack: webpackConfig,
    exclude: [
    ],
    reporters: ['super-dots', 'mocha'],
    superDotsReporter: {
      nbDotsPerLine : 50
    },
    superDotsReporter: {
      icon: {
          success : '✔',
          failure : '✖',
          ignore  : 'ℹ'
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [
        'Chrome'
    ],
    singleRun: false,
    concurrency: Infinity
  })
}
