/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-08-12 22:50:45
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-08-12 23:30:45
 */
let currentToken = null;
function emit (token) {
  
  console.log(token);
}
const EOF = Symbol("EOF"); // EOF: End of File

function data(c) {
  if (c == "<") {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: 'EOF'
    })
    return;
  } else {
    emit({
      type: 'text',
      content: c
    })
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
    }
    return tagName(c);
  } else {
    return;
  }
}
function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    // <span
    currentToken = {
      type: "endTag",
      tagName: ""
    }
    return tagName(c);
  } else if (c === ">") {
    // </>
  } else if (c === EOF) {
    // </EOF
  } else {
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
    currentToken.tagName += c //.toLowerCase()
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
  } else if (c == ">") {
    // <html> 普通的开始标签，所以需要结束掉这个标签，开始回到data状态解析下一个标签，
    return data;
  } else if (c == "=") {
    return beforeAttributeName;
  } else {
    return beforeAttributeName;
  }
}
function selfClosingStartTag(c) {
  if (c == "c") {
    currentToken.isSelfClosing = true;
    return data;
  } else if (c === "EOF") {
  } else {
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
};

console.log('111');