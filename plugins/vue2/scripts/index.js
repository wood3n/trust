const path = require("path");

module.exports = function (api, projectName) {
  api.extendPkg({
    name: projectName,
    dependencies: {
      vue: "^2.6.14",
    },
    browserslist: {
      development: ["last 1 version"],
      production: ["> 1%", "last 2 versions", "ie 10"],
    },
  });

  // 相对于执行的lib目录
  api.render(path.resolve(__dirname, "../template"), {
    projectName,
  });
};
