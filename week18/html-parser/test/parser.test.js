/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-12-04 08:38:59
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-12-04 08:48:12
 */
var assert = require("assert");
// var add = require("../add.js").add;
// var mul = require("../add.js").mul;

import { parseHTML } from "../src/parser.js";

describe("parse html", function () {
  it("<a>abc</a>", function () {
    let tree = parseHTML("<a></a>");
    assert.equal(tree.children[0].tagName, "a");
    assert.equal(tree.children[0].children.length, 0);
  });

  it('<a href="//time.geekbang.org"></a>', function () {
    let tree = parseHTML('<a href="//time.geekbang.org"></a>');
    assert.equal(tree.children[0].tagName, "a");
    assert.equal(tree.children[0].children.length, 0);
  });
});
