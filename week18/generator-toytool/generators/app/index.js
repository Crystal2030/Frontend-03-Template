let Generator = require('yeoman-generator')

module.exports = class extends (
  Generator
) {
  constructor(args, opts) {
    super(args, opts)
  }

  async initPackage() {
    let answer = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname,
      },
    ])

    const pkgJson = {
      name: answer.name,
      version: '1.0.0',
      description: '',
      main: 'generators/app/index.js',
      scripts: {
        build: 'webpack',
        test: 'mocha --require @babel/register',
        coverage: 'nyc npm run test',
      },
      author: '',
      license: 'ISC',
      devDependencies: {
        webpack: '^4.44.1',
      },
      dependencies: {},
    }

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson)
    this.npmInstall(['vue'], { 'save-dev': false })
    this.npmInstall(
      [
        'webpack',
        'webpack-cli',
        'vue-loader',
        'vue-template-compiler',
        'vue-style-loader',
        'css-loader',
        'copy-webpack-plugin',
        'babel-loader',
        '@babel/core',
        '@babel/preset-env',
        '@babel/register',
        '@istanbuljs/nyc-config-babel',
        'babel-plugin-istanbul',
        'mocha',
        'nyc',
      ],
      { 'save-dev': true }
    )

    this.fs.copyTpl(
      this.templatePath('sample-test.js'),
      this.destinationPath('test/sample-test.js')
    )
    this.fs.copyTpl(
      this.templatePath('.babelrc'),
      this.destinationPath('.babelrc')
    )
    this.fs.copyTpl(this.templatePath('.nycrc'), this.destinationPath('.nycrc'))
    this.fs.copyTpl(
      this.templatePath('HelloWorld.vue'),
      this.destinationPath('src/HelloWorld.vue'),
      { title: 'Templating with Yeoman' }
    )
    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js')
    )
    this.fs.copyTpl(
      this.templatePath('main.js'),
      this.destinationPath('src/main.js')
    )
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('src/index.html'),
      { title: answer.name }
    )
  }
}
