const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { LoaderOptionsPlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const PROJECT = "cheese-tax";
const PAGE_TITLE = "ch57x keyboard tool";

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const distPath = path.join(__dirname, "dist");
  const srcPath = path.join(__dirname, "src");

  return {
    entry: "./src/index.tsx",
    output: {
      clean: true,
      path: distPath,
      filename: `${PROJECT}.[name].[contenthash].js`,
    },

    devServer: {
      port: 8080,
      static: {
        publicPath: distPath,
      },
      client: {
        overlay: {
          runtimeErrors: false,
        },
      },
      historyApiFallback: true,
    },

    devtool: isProduction ? undefined : "source-map",
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
      extensions: [".ts", ".tsx", ".js"],
    },

    module: {
      rules: [
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: `${PROJECT}/fonts/[name].[contenthash][ext]`,
          },
        },
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
        },
        {
          test: /\.css$/i,
          include: srcPath,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            "postcss-loader",
          ],
        },
      ],
    },

    ignoreWarnings: [/Failed to parse source map/],

    plugins: [
      new LoaderOptionsPlugin({
        options: {
          optimizations: {
            splitChunks: {
              chunks: "all",
            },
            minimize: isProduction,
          },
        },
      }),
      new HtmlWebpackPlugin({
        title: PAGE_TITLE,
        filename: `${PROJECT}.html`,
        template: "index.template.html",
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: `${PROJECT}.[contenthash].css`,
            }),
          ]
        : []),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin()],
    },
  };
};
