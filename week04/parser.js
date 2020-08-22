/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-08-12 22:50:45
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-08-15 18:41:41
 */
const css = require("css");
const layout = require("./layout.js");
const EOF = Symbol("EOF"); // EOF: End of File
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack = [{ type: "document", children: [] }];

// 加入一个新的函数，addCSSRules,把CSS规则暂存到一个数组中
let rules = [];
function addCSSRules(text) {
  var ast = css.parse(text);
  // console.log(JSON.stringify(ast, null, "    "));
  rules.push(...ast.stylesheet.rules);
}

// 这里只处理简单选择器：类选择器，id选择器和元素选择器
// .a
// #a
// div
// TODO: 实现复合选择器，实现支持空格的Class选择器
function match(element, selector) {
  // 用attribute判断当前元素是否是文本节点，如果是文本节点，就直接结束
  if (!selector || !element.attributes) {
    return false;
  }

  if (selector.charAt(0) == "#") {
    var attr = element.attributes.filter(attr => attr.name === "id")[0];
    if (attr && attr.value === selector.replace("#", "")) {
      return true;
    }
  } else if (selector.charAt(0) == ".") {
    var attr = element.attributes.filter(attr => attr.name === "class")[0];
    if (attr && attr.value === selector.replace(".", "")) {
      return true;
    }
  } else {
    if (element.tagName === selector) {
      return true;
    }
  }

  return false;
}

// TODO: selectorParts 里面去解析复合选择器
function specificity(selector) {
  // 第0位对应行内样式，第1位对应ID选择器，第2位对应类选择器，第三位对应标签选择器
  let p = [0, 0, 0, 0];
  let selectorParts = selector.split(" ");
  for (let part of selectorParts) {
    if (part.charAt(0) === "#") {
      p[1] += 1;
    } else if (part.charAt(0) === ".") {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  }
  return sp1[3] - sp2[3];
}

function computeCSS(element) {
  // console.log(rules);
  // console.log("compute CSS for Element", element);
  var elements = stack.slice().reverse(); // 获取父元素序列
  if (!element.computedStyle) {
    element.computedStyle = {};

    for (let rule of rules) {
      // 简单选择器
      var selectorParts = rule.selectors[0].split(" ").reverse();

      // 简单选择器最后一个reverse的0跟当前元素计算是否匹配
      if (!match(element, selectorParts[0])) {
        continue;
      }

      let matched = false;
      var j = 1; // j表示当前选择器的位置
      // i表示当前元素的位置
      for (var i = 0; i < elements.length; i++) {
        if (match(elements[i], selectorParts[j])) {
          // 如果元素能够匹配到选择器，j自增
          j++;
        }

        // 如果所有丶选择器都已经被匹配到，就认为匹配成功
        if (j >= selectorParts.length) {
          matched = true;
        }

        if (matched) {
          // 如果匹配到， 我们要加入
          console.log("Element", element, "matched rule", rule);
          var sp = specificity(rule.selectors[0]);
          var computedStyle = element.computedStyle;
          for (var declaration of rule.declarations) {
            if (!computedStyle[declaration.property]) {
              computedStyle[declaration.property] = {};
            }
            if (!computedStyle[declaration.property].specificity) {
              computedStyle[declaration.property].value = declaration.value;
              computedStyle[declaration.property].specificity = sp;
            } else if (
              compare(computedStyle[declaration.property].specificity, sp) < 0
            ) {
              computedStyle[declaration.property].value = declaration.value;
              computedStyle[declaration.property].specificity = sp;
            }
          }
          console.log(element.computedStyle);
        }
      }
    }
  }
}

function emit(token) {
  let top = stack[stack.length - 1];

  if (token.type == "startTag") {
    let element = {
      type: "element",
      children: [],
      attributes: []
    };
    element.tagName = token.tagName;
    for (let p in token) {
      if (p !== "type" && p !== "tagName") {
        element.attributes.push({
          name: p,
          value: token[p]
        });
      }
    }

    computeCSS(element);

    top.children.push(element);
    // element.parent = top

    if (!token.isSelfClosing) {
      stack.push(element);
    }
    // 其他标签（开始标签、结束标签、自封闭标签），当前的文本节点需要清掉
    currentTextNode = null;
  } else if (token.type === "endTag") {
    if (top.tagName !== token.tagName) {
      throw new Error(`Tag start end doesn't match!`);
    } else {
      // 遇到style标签时，执行添加CSS规则的操作
      if (top.tagName === "style") {
        addCSSRules(top.children[0].content);
      }
      layout(top);
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.type === "text") {
    if (currentTextNode === null) {
      currentTextNode = {
        type: "text",
        content: ""
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

function data(c) {
  if (c == "<") {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: "EOF"
    });
    return;
  } else {
    emit({
      type: "text",
      content: c
    });
    return data;
  }
}

function tagOpen(c) {
  if (c === "/") {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: ""
    };
    return tagName(c);
  } else {
    return;
  }
}
function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // 4种有效的空白符结束： tab符，换行符，禁止符和空格 <html prop
    return beforeAttributeName;
  } else if (c == "/") {
    // <html/
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c; //.toLowerCase()
    return tagName;
  } else if (c == ">") {
    emit(currentToken);
    // <html> 普通的开始标签，所以需要结束掉这个标签，开始回到data状态解析下一个标签，
    return data;
  } else {
    return tagName;
  }
}
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // 4种有效的空白符结束： tab符，换行符，禁止符和空格 <html prop
    return beforeAttributeName;
  } else if (c === "/" || c === ">" || c === EOF) {
    // <html> 普通的开始标签，所以需要结束掉这个标签，开始回到data状态解析下一个标签，
    return afterAttributeName(c);
  } else if (c === "=") {
  } else {
    currentAttribute = {
      name: "",
      value: ""
    };
    // console.log("currentAttribute", currentAttribute);
    return attributeName(c);
  }
}
function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
    return afterAttributeName(c);
  } else if (c === "=") {
    return beforeAttributeValue;
  } else if (c === "\u0000") {
  } else if (c === '"' || c === "'" || c === "<") {
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
    return beforeAttributeValue;
  } else if (c === '"') {
    return doubleQuotedAttributeValue;
  } else if (c === "'") {
    return singleQuotedAttributeValue;
  } else if (c === ">") {
  } else {
    return UnquotedAttributeValue(c);
  }
}
function doubleQuotedAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === "\u0000") {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c == "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === "\u0000") {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}
function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
  } else {
    // 可以抛错 这里对应<div class="a"b>这种情况
    throw new Error("afterQuotedAttributeValue error");
    // currentAttribute.value += c;
    // return afterQuotedAttributeValue;
  }
}
function UnquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c == "/") {
    // 这里可以处理 <img id=b/>这种情况
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == "\u0000") {
  } else if (c === '"' || c === "'" || c === "<" || c === "=" || c === "`") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}
function selfClosingStartTag(c) {
  if (c == ">") {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
  } else {
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    // <span
    currentToken = {
      type: "endTag",
      tagName: ""
    };
    return tagName(c);
  } else if (c === ">") {
    // </>
  } else if (c === EOF) {
    // </EOF
  } else {
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === "=") {
    return beforeAttributeValue;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
  } else {
    // 理论上这条分支是多余的，从beforeAttributeName或者attributeName状态进入时c已经确定了
    // currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: "",
      value: ""
    };
    return attributeName(c);
  }
}
module.exports.parseHTML = function parseHTML(html) {
  // html标准里把初始状态叫做data
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  // 这里使用了小技巧：因为html最后是一个文件终结的，而在文件终结位置可能有一些文本节点可能仍然是面临着一个没有结束的状态，所以需要额外给它一个字符，这个字符不能是任何一个有效的字符
  state = state(EOF);
  console.log(stack[0]);
  return stack[0];
};
