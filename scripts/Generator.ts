import glob from "glob";
import path from "path";
import deepmerge from "deepmerge";
import fs from "fs-extra";
import mustache from "mustache";
import PluginAPI from "./PluginAPI";
import { sortObject } from "../utils";
import { CommanderOptions, ServiceType } from "./typings";

class Generator {
  // 项目名称
  projectName: string;
  // 创建项目的文件夹
  folder: string;
  // cli参数
  options: CommanderOptions;
  // 写入package.json的字段
  pkg: Record<string, any>;
  plugins: any[];
  files: Record<string, string>;
  service: ServiceType;

  constructor(projectName: string, folder: string, options: CommanderOptions) {
    this.projectName = projectName;
    this.folder = folder;
    this.options = options || {};
    this.pkg = {
      name: projectName,
      private: true,
      scripts: {
        dev: "hust dev",
        build: "hust build",
      },
      dependencies: {
        hust: "latest",
      },
    };
    this.plugins = [];
    this.files = {};
    this.service = {
      dev: "webpack",
      production: "webpack",
    };
  }

  // TODO:这里后续改成npm包的引入方式
  resolvePlugins = () => {
    const { template } = this.options;

    const pluginPath = path.resolve(process.cwd(), `./plugins/${template || "vue2"}/lib`);
    this.plugins.push({
      id: `@hust/plugin-${template || "vue2"}`,
      apply: require(pluginPath),
    });
  };

  applyPlugins = () => {
    this.plugins.forEach(({ apply }) => {
      apply(new PluginAPI(this), this.projectName);
    });
  };

  // 根据指定模板插件创建项目
  generate = () => {
    // 从cli指定的模板加载并执行plugins
    this.resolvePlugins();
    this.applyPlugins();

    // 生成文件
    Object.entries(this.files).forEach(([sourcePath, content]) => {
      const realPath = path.join(this.folder, sourcePath);
      fs.ensureDirSync(path.dirname(realPath));
      fs.writeFileSync(realPath, content);
    });

    this.installDependency();
  };

  // 安装依赖
  installDependency = () => {
    console.log("Install dependencies...");
    console.log("Installed success");
    process.exit(1);
  };

  // 从指定plugin的模板文件夹查找并加载模板文件内容
  renderTemplate = (templatePath: string, data: object) => {
    const templates = glob.sync("**/*", { cwd: templatePath, dot: true, nodir: true, ignore: ["**/node_modules/**"] });
    templates.forEach(sourcePath => {
      const ext = path.extname(sourcePath);
      const file = fs.readFileSync(path.join(templatePath, sourcePath), "utf8");
      if (ext === ".tpl") {
        const content = mustache.render(file, data);
        this.files[sourcePath.replace(".tpl", "")] = content;
      } else {
        this.files[sourcePath] = file;
      }
    });
  };

  // 拓展package.json
  extendPkg = (pkg: Record<string, any>) => {
    this.pkg = deepmerge(this.pkg, pkg);

    this.pkg.dependencies = sortObject(this.pkg.dependencies);
    if (this.pkg.devDependencies) {
      this.pkg.devDependencies = sortObject(this.pkg.devDependencies);
    }
    this.pkg.scripts = sortObject(this.pkg.scripts, ["dev", "build", "doc", "util"]);
    this.pkg = sortObject(this.pkg, ["name", "version", "private", "scripts", "dependencies", "devDependencies", "peerDependencies", "browserslist", "jest"]);

    this.files["package.json"] = JSON.stringify(this.pkg, null, "\t");
  };

  // 选择构建服务
  extendService = (service: ServiceType) => {
    this.service = service;
  };
}

export default Generator;
