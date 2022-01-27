import { program } from "commander";
import pkg from "../package.json";
import create from "./create";
import serve from "./serve";
import { CommanderOptions } from "./typings";

/**
 * 注册所有cli命令
 */
export default function registerCommand() {
  program.version(pkg.version);

  // hust create [appname]
  program
    .command("create <name>")
    .option("-t, --template", "use template to create a new project")
    .action((name: string, options: CommanderOptions) => {
      create(name, options);
    });

  // hust dev
  program
    .command("dev")
    .description("use hust to run development server")
    .allowUnknownOption()
    .action(name => {
      serve(name);
    });

  // hust build
  program
    .command("build")
    .description("use hust to build production files")
    .action(name => {
      serve(name);
    });

  // hust doc:业务文档生成
  program
    .command("dov")
    .description("use hust to generate business document")
    .action(name => {
      serve(name);
    });

  // hust doc:业务文档生成
  program
    .command("analyze")
    .description("use hust to analyze webpack bundle filesize")
    .action(name => {
      serve(name);
    });

  // hust:util:开发组件文档生成
  program
    .command("util")
    .description("use hust to generate component document")
    .action(name => {
      serve(name);
    });

  // etc...

  program.parse(process.argv);
}
