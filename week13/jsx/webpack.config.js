/**
* @description: description
* @author: liuyun03
* @Date: 2020-10-28 22:42:43
* @LastEditors: liuyun03
* @LastEditTime: 2020-10-29 08:59:32
 */
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
                        plugins: [["@babel/plugin-transform-react-jsx", {pragma: "createElement"}]]
                    }
                }
            }
        ]
    },
    mode: "development"
}