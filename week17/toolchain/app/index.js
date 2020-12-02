/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-11-26 09:16:33
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-12-01 09:41:42
 */
var Generator = require("yeoman-generator");

module.exports = class extends (
  Generator
) {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }

  initPackage() {
    const pkgJson = {
      devDependencies: {
        eslint: "^3.15.0",
      },
      dependencies: {
        react: "^16.2.0",
      },
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath("package.json"), pkgJson);
    this.npmInstall();
  }

  async step1() {
    this.fs.copyTpl(
      this.templatePath("t.html"),
      this.destinationPath("public/index.html"),
      { title: "Templating with Yeoman" }
    );
  }
};
