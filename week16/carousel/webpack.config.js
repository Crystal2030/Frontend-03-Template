/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-10-28 22:42:43
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-20 09:16:02
 */
const path = require("path");
module.exports = {
  entry: "./main.js",

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                { pragma: "createElement" },
              ],
            ],
          },
        },
      },
    ],
  },
  // devServer: {
  //   conntentBase: path.join(__dirname, "dist"),
  //   compress: false,
  //   port: 9000,
  //   compress: true,
  // },
  mode: "development",
};
