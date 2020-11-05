/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-11-04 19:35:54
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-05 09:26:02
 */
import { Timeline, Animation } from "./animation.js";
import { ease, easeIn } from "./ease.js";

let tl = new Timeline();

tl.start();

tl.add(
  new Animation(
    document.querySelector("#el").style,
    "transform",
    0,
    500,
    2000,
    0,
    easeIn,
    (v) => `translateX(${v}px)`
  )
);

document.querySelector("#el2").style.transition = "transform ease-in 2s";
document.querySelector("#el2").style.transform = "translateX(500px)";

document
  .querySelector("#pause-btn")
  .addEventListener("click", () => tl.pause());
document
  .querySelector("#resume-btn")
  .addEventListener("click", () => tl.resume());
