/**
 * @description: 手势
 * @author: liuyun03
 * @Date: 2020-11-10 09:12:32
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-16 09:49:08
 */

let handler;
let startX, startY;
let isPan = false,
  isTap = true,
  isPress = false;

export class Dispatcher {
  constructor(element) {
    this.element = element;
  }
  dispatch(type, properties) {
    let event = new Event(type);
    for (let name in properties) {
      event[name] = properties[name];
    }
    this.element.dispatchEvent(event);
  }
}

// listen -> recognize -> dispatch
// new Listener(new Recognizer(dispatch))
export class Listener {
  constructor(element, recognizer) {
    let isListeningMouse = false;

    let contexts = new Map();

    element.addEventListener("mousedown", (event) => {
      let context = Object.create(null);
      contexts.set("mouse" + (1 << event.button), context);

      recognizer.start(event, context);

      let mousemove = (event) => {
        //mousedown里面没有event.button, 有event.buttons(表示有哪些键呗按下来了，是掩码表示，0b11111表示5个键全按下来了，0b00001表示只按下左键，0b00011表示中键和左键都暗下来了)
        let button = 1;

        while (button <= event.buttons) {
          // 调整右键和中间顺序 order of buttons & button property is not same
          if (button & event.buttons) {
            let key;
            if (button === 2) {
              key = 4;
            } else if (button === 4) {
              key = 2;
            } else {
              key = button;
            }
            contexts.get("mouse" + key);
            recognizer.move(event, context);
          }
          button = button << 1;
        }
      };
      let mouseup = (event) => {
        let context = contexts.get("mouse" + (1 << event.button));
        recognizer.end(event, context);
        contexts.delete("mouse" + (1 << event.button));
        if (event.buttons === 0) {
          document.removeEventListener("mousemove", mousemove);
          document.removeEventListener("mouseup", mouseup);
          isListeningMouse = false;
        }
      };
      if (!isListeningMouse) {
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
        isListeningMouse = true;
      }
    });

    element.addEventListener("touchstart", (event) => {
      for (let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognizer.start(touch, context);
      }
    });
    element.addEventListener("touchmove", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.move(touch, context);
      }
    });
    element.addEventListener("touchend", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });
    element.addEventListener("touchcancel", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    });
  }
}

export class Recognizer {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
  start(point, context) {
    (context.startX = point.clientX), (context.startY = point.clientY);
    context.points = [
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      },
    ];

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    // 停留0.5s就认为是press事件
    handler = setTimeout(() => {
      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      context.handler = null;
      this.dispatcher.dispach("press", {});
    }, 500);
  }

  move(point, context) {
    let dx = point.clientX - context.startX,
      dy = point.clientY - context.startY;
    // 是否移动10px
    if (!isPan && dx ** 2 + dy ** 2 > 100) {
      context.isTap = false;
      context.isPan = true;
      context.isPress = false;
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      this.dispatcher.dispach("panstart", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
      clearTimeout(handler);
    }

    if (context.isPan) {
      this.dispatcher.dispach("panstart", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
    }

    // 只存储半秒内的速度
    context.points = context.points.filter(
      (point) => Date.now() - point.t < 500
    );
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    });
  }

  end(point, context) {
    if (context.isTap) {
      this.dispatcher.dispatch("tap", {});
      clearTimeout(context.handler);
    }

    if (context.isPress) {
      dispatch("pressEnd", {});
    }
    context.points = context.points.filter(
      (point) => Date.now() - point.t < 500
    );
    let d, v;
    if (!context.points.length) {
      v = 0;
    } else {
      d = Math.sqrt(
        (point.clientY - context.points[0].x) ** 2 +
          (point.clientY - context.points[0].y) ** 2
      );
      v = d / (Date.now() - context.points[0].t);
    }
    if (v > 1.5) {
      this.dispatcher.dispach("flick", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v,
      });
      context.isFlick = true;
    } else {
      context.isFlick = false;
    }

    if (context.isPan) {
      this.dispatcher.dispach("pandend", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
      });
    }
  }
  // touchcancel类似touchend同样要delete
  cancel(point, context) {
    clearTimeout(context.handler);
    this.dispatcher.dispach("cancel", {});
  }
}

export function enableGesture(element) {
  new Listener(element, new Recognizer(new Dispatcher(element)));
}
