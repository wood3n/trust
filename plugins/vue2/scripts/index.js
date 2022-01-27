const path = require("path");

module.exports = function (api, projectName) {
  api.extendPkg({
    name: projectName,
    dependencies: {
      vue: "^2.6.14",
      "vue-router": "^3.5.3",
      vuex: "^4.0.2",
      "vue-i18n": "^8.15.4",
    },
    browserslist: {
      development: ["last 1 version"],
      production: ["> 1%", "last 2 versions", "ios >= 8", "android >= 4.0"],
    },
  });

  // 相对于执行的lib目录
  api.render(path.resolve(__dirname, "../template"), {
    projectName,
  });
};
