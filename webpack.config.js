const path = require("path");

const mode = process.env.NODE_ENV;

const webpack = require("webpack");

module.exports = {
  devServer: {
    publicPath: "/build/",
    proxy: {
      "/api": "http://localhost:3000",
      "/saved": "http://localhost:3000",
      "/authenticate": "http://localhost:3000",
    },
    port: 8080,
    hot: true,
  },
  entry: "./client/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "http://localhost:8080/build/",
  },
  mode,
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },
      {
        test: /\.s?css$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: "url-loader",
        },
      },
    ],
  },
};
