/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-10-28 22:43:20
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-10-29 10:35:25
 */
function createElement(type, attributes, ...children) {
  let element;
  if (typeof type === "string") {
    element = new ElementWrapper(type);
  } else {
    element = new type();
  }
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  for (let child of children) {
    if (typeof child === "string") {
      //   child = document.createTextNode(child);
      child = new TextWrapper(child);
    }
    element.appendChild(child);
  }

  return element;
}

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mounteTo(this.root);
  }
  mounteTo(parent) {
    parent.appendChild(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mounteTo(this.root);
  }
  mounteTo(parent) {
    parent.appendChild(this.root);
  }
}

class Div {
  constructor() {
    this.root = document.createElement("section");
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mounteTo(this.root);
  }
  mounteTo(parent) {
    parent.appendChild(this.root);
  }
}

let a = (
  <Div id="a">
    <span>hello world</span>
    <span>javascript</span>
    <span>nodejs</span>
  </Div>
);

// document.body.appendChild(a);

a.mounteTo(document.body);
