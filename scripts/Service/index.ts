import path from "path";
import fs from "fs-extra";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { OnProxyResCallback } from "http-proxy-middleware/dist/types";
import webpackMerge from "webpack-merge";
import ChainWebpackConfig from "webpack-chain";
import BundleAnalyzer from "webpack-bundle-analyzer";
import portfinder from "portfinder";
import chokidar from "chokidar";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import webpackBase from "./webpack/webpack.config";
import chalk from "chalk";
import { log } from "console";
import { logger } from "../../utils";
import { ConfigType } from "../typings";

class Service {
  commander: string;
  cwd: string;
  projectConfig: ConfigType;
  projectConfigPath: string;
  constructor(commander: string) {
    this.commander = commander;
    this.cwd = process.cwd();
    this.projectConfigPath = path.resolve(this.cwd, "hust.config.js");
    // 项目配置
    this.projectConfig = require(this.projectConfigPath);

    this.loadEnv();
  }

  /*
   * 执行构建程序
   */
  run = async () => {
    if (this.commander === "dev") {
      this.dev();
    }

    if (this.commander === "build") {
      this.build();
    }

    if (this.commander === "analyze") {
      this.analyze();
    }
  };

  dev = async () => {
    logger.info("Starting the development server...\n");
    const webpackConfig = this.resolveWebpackConfig();
    const compiler = webpack(webpackConfig);
    const { proxy } = this.projectConfig;

    // 将代理地址添加到 Response header 上
    // https://github.com/chimurai/http-proxy-middleware/issues/48#issuecomment-819717044
    const onProxyRes: OnProxyResCallback = proxyRes => {
      // @ts-expect-error
      proxyRes.headers["x-real-url"] = `${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`;
    };

    if (Array.isArray(proxy)) {
      proxy.forEach(options => {
        options.onProxyRes = onProxyRes;
      });
    } else if (typeof proxy === "object") {
      Object.keys(proxy).forEach(pattern => {
        if (typeof proxy[pattern] === "string") {
          proxy[pattern] = {
            target: proxy[pattern],
            onProxyRes,
          };
        } else if (typeof proxy[pattern] === "object") {
          // @ts-expect-error wrong type check for string
          proxy[pattern].onProxyRes = onProxyRes;
        }
      });
    }

    // 获取客户端ipv4
    const localIPv4 = await WebpackDevServer.internalIP("v4");
    let port = 3000;
    portfinder.basePort = port;
    port = await portfinder.getPortPromise();

    const server = new WebpackDevServer(
      {
        hot: true,
        liveReload: false,
        compress: true,
        port,
        host: "0.0.0.0",
        proxy,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
      },
      compiler
    );

    server.startCallback(() => {
      // watch hust.config.js change
      const watcher = chokidar.watch(this.projectConfigPath).on("change", () => {
        logger.warn("checked hust.config.js changed, restarting the server...");
        server.stopCallback(() => {
          watcher.close();
          this.dev();
        });
      });
    });

    // WDS 没有编译完成回调事件，所以需要注册webpack hooks
    compiler.hooks.done.tap("hust dev", () => {
      log();
      logger.info(`  App running at:`);
      log(`  - Local:   ${chalk.green(`http://localhost:${port}`)}`);
      log(`  - Network: ${chalk.green(`http://${localIPv4}:${port}`)}`);
      log();
    });

    server.start().catch(err => {
      console.log(err);
      process.exit(1);
    });
  };

  build = () => {
    logger.info("Starting build optimized resources...\n");
    const webpackConfig = this.resolveWebpackConfig();
    const compiler = webpack(webpackConfig);
    compiler.run((err, stats) => {
      console.log(err);

      if (stats) {
        fs.writeFileSync(`${webpackConfig.output?.path}/bundle-stats.json`, JSON.stringify(stats.toJson()));
      }
    });
  };

  analyze = () => {
    logger.info("Starting build optimized resources...\n");
    const webpackConfig = this.resolveWebpackConfig();
    webpackConfig.plugins?.push(
      new BundleAnalyzer.BundleAnalyzerPlugin({
        analyzerMode: "server",
        analyzerPort: 9090,
        openAnalyzer: true,
        logLevel: "info",
        defaultSizes: "parsed",
      })
    );
    webpack(webpackConfig, () => {
      // [Stats Object](#stats-object)
      logger.success("build analysis resource successfully, now you can see the filesize map in your default browser.");
    });
  };

  /**
   * 加载环境变量
   */
  loadEnv = () => {
    const climap: Record<string, string> = {
      dev: "development",
      build: "production",
      analyze: "production",
    };

    process.env.NODE_ENV === climap[this.commander];

    const env = dotenv.config({ path: path.resolve(this.cwd, ".env") });
    dotenvExpand.expand(env);
  };

  // 获取全部webpack的配置
  resolveWebpackConfig = () => {
    const userConfigs = this.projectConfig;
    const baseWebpackConfig = webpackBase(this.projectConfig);

    // 获取chainWebpack的配置项
    let chainWebpackConfig: webpack.Configuration = {};
    if (userConfigs.chainWebpack) {
      const chainConfig = new ChainWebpackConfig();
      userConfigs.chainWebpack(chainConfig);
      chainWebpackConfig = chainConfig.toConfig();
    }

    let simpleConfig: webpack.Configuration = {};
    if (userConfigs.configureWebpack) {
      if (typeof userConfigs.configureWebpack === "function") {
        simpleConfig = userConfigs.configureWebpack(baseWebpackConfig);
      } else {
        simpleConfig = userConfigs.configureWebpack;
      }
    }

    return webpackMerge(baseWebpackConfig, chainWebpackConfig, simpleConfig);
  };
}

export default Service;
