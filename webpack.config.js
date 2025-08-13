const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// This file tells webpack (our build tool) how to process and bundle your React app
module.exports = {
  // Entry point - where webpack starts building your app
  entry: './src/index.js',
  
  // Where to put the built files
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Clean the output directory before each build
  },
  
  // Rules for processing different file types
  module: {
    rules: [
      {
        // Process JavaScript and JSX files with Babel
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        // Process CSS files
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  
  // Plugins extend webpack's functionality
  plugins: [
    // This plugin generates an HTML file with your bundle included
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ],
  
  // Development server configuration
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    open: true, // Automatically open browser
    hot: true,  // Enable hot reloading (updates without full page refresh)
    historyApiFallback: true // Support for React Router (if you add it later)
  },
  
  // File extensions webpack should resolve
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
