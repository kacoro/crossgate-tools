const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const spawn = require('child_process').spawn;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
console.log(process.env.NODE_ENV)
const devConfig = {
  target: 'electron-renderer',
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  devServer: {
    port: 3000,
    after() {
      spawn('npm', ['run', 'start-electron'], {
          shell: true,
          env: process.env,
          stdio: 'inherit'
        })
        .on('close', code => process.exit(code))
        .on('error', spawnError => console.error(spawnError));
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      "@container": path.resolve(__dirname, 'src/container/')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}
const productionConfig = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        exclude: /\/node_modules/,
        terserOptions: {
          ecma: undefined,
          parse: {},
          compress: {
            drop_console: true, //console
            drop_debugger: true,
          },
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
        },
      }),
    ],
    // minimizer: [
    //   new UglifyJsPlugin({
    //     parallel: true,
    //     uglifyOptions: {
    //       // 删除注释
    //       // output: {
    //       //   comments: false
    //       // },
    //       // warnings: false,
    //       // 删除console debugger 删除警告
    //       compress: {
    //         drop_console: true, //console
    //         drop_debugger: true,
    //         // pure_funcs: ['console.log'] //移除console
    //       }
    //     }
    //   })
    // ]
  }
}
let config = devConfig
if (process.env.NODE_ENV == "production") {
  config = Object.assign({},devConfig, productionConfig)
} else {
  config = devConfig
}

module.exports = config