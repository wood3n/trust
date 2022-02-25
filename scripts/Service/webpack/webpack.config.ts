import path from "path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CSSMinimizerPlugin from "css-minimizer-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import WebpackBar from "webpackbar";
import { ConfigType } from "../../typings";

const { VueLoaderPlugin } = require("vue-loader");

export default function (projectConfig: ConfigType): webpack.Configuration {
  const cwd = process.cwd();
  const { alias, define } = projectConfig;
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";
  const outputPath = path.resolve(cwd, "dist");

  const getCSSLoader = (cssOptions: any, preProcessor?: any) => {
    const loaders = [
      isDevelopment && require.resolve("style-loader"),
      isProduction && {
        loader: MiniCssExtractPlugin.loader,
        // relative to static/css/*.css
        options: {
          publicPath: "../../",
        },
      },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions,
      },
      {
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            ident: "postcss",
            config: false,
            plugins: [
              "postcss-flexbugs-fixes",
              [
                "postcss-preset-env",
                {
                  autoprefixer: {
                    flexbox: "no-2009",
                  },
                  stage: 3,
                },
              ],
              // allow use browserlist in package.json
              "postcss-normalize",
            ],
          },
          sourceMap: true,
        },
      },
    ].filter(Boolean) as webpack.RuleSetRule[];

    if (preProcessor) {
      loaders.push(preProcessor);
    }

    return loaders;
  };

  return {
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    entry: path.resolve(cwd, "src/main.js"),
    output: {
      chunkFilename: isDevelopment ? "static/js/[name].chunk.js" : "static/js/[name].[contenthash:8].chunk.js",
      filename: isDevelopment ? "static/js/bundle.js" : `static/js/[name].[contenthash:8].js`,
      // webpack5 Asset Modules output file
      assetModuleFilename: "static/media/[name].[hash][ext]",
      path: outputPath,
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.vue$/i,
          exclude: /node_modules/,
          use: "vue-loader",
        },
        {
          test: /\.(js|mjs)$/i,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    // allow use ecma proposal features:https://babeljs.io/docs/en/babel-preset-env#shippedproposals
                    shippedProposals: true,
                    corejs: { version: "3.20", proposals: true },
                  },
                ],
              ],
              plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"],
            },
          },
        },
        {
          test: /\.css$/i,
          use: getCSSLoader({
            importLoader: 1,
            sourceMap: true,
            // .module.css will use css modules
            modules: {
              auto: true,
            },
          }),
        },
        {
          test: /\.less$/i,
          use: getCSSLoader(
            {
              importLoader: 2,
              sourceMap: true,
              modules: {
                auto: true,
              },
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            }
          ),
        },
        {
          test: /\.(scss|sass)$/i,
          use: getCSSLoader(
            {
              importLoader: 2,
              sourceMap: true,
              modules: {
                auto: true,
              },
            },
            "sass-loader"
          ),
        },
        {
          test: [/\.avif$/i],
          type: "asset",
          mimetype: "image/avif",
          parser: {
            dataUrlCondition: {
              // 4kB
              maxSize: 1024 * 4,
            },
          },
        },
        {
          test: [/\.bmp$/i, /\.gif$/i, /\.jpe?g$/i, /\.png$/i],
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 1024 * 4,
            },
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ].filter(Boolean),
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(cwd, "./public/index.html"),
        minify: isProduction,
      }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),
      // exclude node_modules/moment/locale/*.js, use moment.locale(“zh-CN”) instead
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      // copy public to dist output folder
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public/**/*",
            to: outputPath,
            // 防止和HtmlWebpackPlugin生成的html重复
            globOptions: {
              dot: true,
              gitignore: true,
              ignore: ["index.html"],
            },
          },
        ],
      }),
      // convert process
      new webpack.DefinePlugin(
        Object.assign(
          {},
          {
            "process.env": process.env,
          },
          define
        )
      ),
      new WebpackBar(),
    ].filter(Boolean),
    // hardsource cache, make compiler fast:https://webpack.js.org/configuration/cache/#cachebuilddependencies
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    },
    optimization: {
      // only optimize in production
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              ecma: 5,
              inline: 2,
              // remove console
              drop_console: true,
              // remove debugger
              drop_debugger: true,
            },
          },
        }),
        new CSSMinimizerPlugin(),
      ],
    },
    resolve: {
      alias: alias
        ? alias
        : {
            "@/*": path.resolve(cwd, "./src"),
          },
      extensions: [".vue", ".ts", ".jsx", ".tsx", "..."],
    },
    // disable webpack dev server log
    infrastructureLogging: {
      level: "none",
    },
    stats: "errors-only",
  };
}
