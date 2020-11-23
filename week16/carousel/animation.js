/**
 * @description: 时间线
 * @author: liuyun03
 * @Date: 2020-11-03 09:11:05
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-05 16:30:51
 */

const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("add-time");
const PAUSE_START = Symbol("pause-start");
const PAUSE_TIME = Symbol("pause-time");

export class Timeline {
  constructor() {
    this.state = "inited";
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
  }
  start() {
    if (this.state !== "inited") {
      return;
    }
    this.state = "started";
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      let now = Date.now();
      for (let animation of this[ANIMATIONS]) {
        let t;

        if (this[START_TIME].get(animation) < startTime) {
          t = now - startTime - this[PAUSE_TIME] - animation.delay;
        } else {
          t =
            now -
            this[START_TIME].get(animation) -
            this[PAUSE_TIME] -
            animation.delay;
        }
        if (animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          t = animation.duration;
        }
        if (t > 0) {
          animation.receive(t);
        }
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    };
    this[TICK]();
  }
  // set rate() { }
  // get rate() { }
  pause() {
    if (this.state !== "started") {
      return;
    }
    this.state = "paused";
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }

  resume() {
    if (this.state !== "paused") {
      return;
    }
    this.state = "started";
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  }

  reset() {
    this.state = "inited";
    this.pause();
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[PAUSE_START] = 0;
    this[TICK_HANDLER] = null;
  }

  add(animation, startTime) {
    if (arguments.length < 2) {
      startTime = Date.now();
    }
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, startTime);
  }
}

/**
 * object：是想要添加动画的对象；
 * property：是想要变换的属性；
 * start：是属性的初始值；
 * end：是属性的最终值；
 * duration：整个动画的持续时间；
 * delay：动画延迟多长时间开始播放；
 * timingFunction：差值算法。
 * template：是一个抽象出来的属性的模版，是对不同的 property 的抽象（不同 property 要求的字符串不一样）。
 */
export class Animation {
  constructor(
    object,
    property,
    startValue,
    endValue,
    duration,
    delay,
    timingFunction,
    template
  ) {
    timingFunction = timingFunction || ((v) => v);
    template = template || ((v) => v);
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.delay = delay;
    this.timingFunction = timingFunction;
    this.template = template;
  }
  receive(time) {
    let range = this.endValue - this.startValue;
    let progress = this.timingFunction(time / this.duration);
    this.object[this.property] = this.template(
      this.startValue + range * progress
    );
  }
}
