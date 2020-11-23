/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-11-23 09:31:28
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-23 09:31:28
 */
import { Component, createElement } from "./framework.js";

export class Button extends Component {
  constructor() {
    super();
  }
  render() {
    this.childContainer = <span />;
    this.root = (<div>{this.childContainer}</div>).render();
    return this.root;
  }
  appendChild(child) {
    if (!this.childContainer) {
      this.render();
    }
    this.childContainer.appendChild(child);
  }
}
