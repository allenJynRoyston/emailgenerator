const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  // entry point
  entry: './src/main.js',

  // output to
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },

  // modules
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'css' : 'css-loader',
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
            'js': 'babel-loader?presets[]=es2015,presets[]=stage-3,plugins[]=transform-runtime'
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        loader: 'url-loader',
        options: {
          mimetype: 'image/png',
          limit: 8192
        }          
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },

  // resolves
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },

  // dev server
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },

  // performance
  performance: {
    hints: false
  },

  // plugins
  plugins: [    
    new CleanWebpackPlugin(['dist']),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        "root.jQuery": "jquery"
    })
  ],  
}