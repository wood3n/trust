// 检查客户端Nodejs版本和CLI要求版本是否匹配
import pleaseUpgradeNode from "please-upgrade-node";
import pkg from "../package.json";

export default function checkNodeVersion() {
  pleaseUpgradeNode(pkg, {
    message: function (requiredVersion) {
      return `please upgrade your node version to ${requiredVersion}`;
    },
  });
}
