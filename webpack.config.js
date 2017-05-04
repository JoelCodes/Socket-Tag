const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: [
    './client/index.jsx',
  ],
  output: {
    path: path.join(__dirname, 'public/dist'),
    filename: 'bundle.js',
    publicPath: './build/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      include: path.join(__dirname, 'client'),
    },
    {
      test: /\.s?css$/,
      loaders: ['style-loader', 'css-loader', 'sass-loader'],
    }],
  },
};
