import Generator from "./Generator";
import { ServiceType } from "./typings";

type GeneratorInstance = InstanceType<typeof Generator>;

class PluginAPI {
  generator: GeneratorInstance;

  constructor(generator: GeneratorInstance) {
    this.generator = generator;
  }

  /**
   * 从安装插件的路径中生成并渲染模板文件
   * @param templatePath
   * @param data
   */
  render = (path: string, data: object) => {
    this.generator.renderTemplate(path, data);
  };

  /**
   * 拓展package.json字段
   * @param pkg
   */
  extendPkg = (pkg: Record<string, any>) => {
    this.generator.extendPkg(pkg);
  };

  /**
   * 选择构建程序
   * @param service
   */
  extendService = (service: ServiceType) => {
    this.generator.extendService(service);
  };
}

export default PluginAPI;
