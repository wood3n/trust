import webpack from "webpack";
import webpackDevServer from "webpack-dev-server";
import ChainWebpackConfig from "webpack-chain";
import PluginAPI from "./PluginAPI";

/**
 * CLI额外参数
 */
export interface CommanderOptions {
  template: "vue2" | "vue3";
}

/**
 * 插件参数
 */
export interface Plugin {
  projectName: string;
  api: InstanceType<typeof PluginAPI>;
  options: CommanderOptions;
}

/**
 * 构建服务
 */
export interface ServiceType {
  dev: "vite" | "webpack";
  production: "vite" | "webpack";
}

/**
 * 项目配置
 */
export interface ConfigType {
  /*
   * webpack resolve alias
   */
  alias?:
    | {
        /**
         * New request.
         */
        alias: string | false | string[];
        /**
         * Request to be redirected.
         */
        name: string;
        /**
         * Redirect only exact matching request.
         */
        onlyModule?: boolean;
      }[]
    | { [index: string]: string | false | string[] };
  /*
   * webpack dev server proxy
   */
  proxy?: webpackDevServer.ProxyConfigMap | webpackDevServer.ProxyConfigArray | webpackDevServer.ProxyArray | undefined;
  /*
   * 定义全局静态变量，会被webpack-defing-plugin处理
   */
  define?: Record<string, any>;
  /**
   * use webpack-chain to extend webpack config
   */
  chainWebpack?: (config: InstanceType<typeof ChainWebpackConfig>) => void;
  /**
   * simple use webpack extends
   */
  configureWebpack?: ((config: webpack.Configuration) => webpack.Configuration) | webpack.Configuration;
}

export declare function defineConfig(config: ConfigType): ConfigType;
