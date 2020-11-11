/**
 * @description: 手势
 * @author: liuyun03
 * @Date: 2020-11-10 09:12:32
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-11 09:57:41
 */
let element = document.documentElement;
let isListeningMouse = false;

element.addEventListener("mousedown", (event) => {
  //   console.log(event.button);
  let context = Object.create(null);
  contexts.set("mouse" + (1 << event.button), context);

  start(event, context);

  let mousemove = (event) => {
    //mousedown里面没有event.button, 有event.buttons(表示有哪些键呗按下来了，是掩码表示，0b11111表示5个键全按下来了，0b00001表示只按下左键，0b00011表示中键和左键都暗下来了)
    let button = 1;
    console.log(event.buttons);

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
        move(event, context);
      }
      button = button << 1;
    }
  };
  let mouseup = (event) => {
    console.log(event.button);
    let context = contexts.get("mouse" + (1 << event.button));
    end(event, context);
    contexts.delete("mouse" + (1 << event.button));
    if (event.buttons === 0) {
      element.removeEventListener("mousemove", mousemove);
      element.removeEventListener("mouseup", mouseup);
      isListeningMouse = false;
    }
  };
  if (!isListeningMouse) {
    element.addEventListener("mousemove", mousemove);
    element.addEventListener("mouseup", mouseup);
    isListeningMouse = true;
  }
});

let contexts = new Map();

element.addEventListener("touchstart", (event) => {
  for (let touch of event.changedTouches) {
    let context = Object.create(null);
    contexts.set(touch.identifier, context);
    start(touch, context);
  }
});
element.addEventListener("touchmove", (event) => {
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    move(touch, context);
  }
});
element.addEventListener("touchend", (event) => {
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    end(touch, context);
    contexts.delete(touch.identifier);
  }
});
element.addEventListener("touchcancel", (event) => {
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    cancel(touch, context);
    contexts.delete(touch.identifier);
  }
});
let handler;
let startX, startY;
let isPan = false,
  isTap = true,
  isPress = false;

let start = (point, context) => {
  //   console.log("start-->", point.clientX, point.clientY);
  (context.startX = point.clientX), (context.startY = point.clientY);

  context.isTap = true;
  context.isPan = false;
  context.isPress = false;

  // 停留0.5s就认为是press事件
  handler = setTimeout(() => {
    context.isTap = false;
    context.isPan = false;
    context.isPress = true;
    context.handler = null;
    console.log("press");
  }, 500);
};
let move = (point, context) => {
  let dx = point.clientX - context.startX,
    dy = point.clientY - context.startY;
  // 是否移动10px
  if (!isPan && dx ** 2 + dy ** 2 > 100) {
    context.isTap = false;
    context.isPan = true;
    context.isPress = false;
    console.log("panstart");
    clearTimeout(handler);
  }

  if (context.isPan) {
    console.log("pan事件", dx, dy);
  }
  //   console.log("move-->", point.clientX, point.clientY);
};
let end = (point, context) => {
  if (context.isTap) {
    console.log("tap事件");
    clearTimeout(context.handler);
  }
  if (context.isPan) {
    console.log("panend");
  }
  if (context.isPress) {
    console.log("pressEnd");
  }
  //   console.log("end-->", point.clientX, point.clientY);
};
let cancel = (point, context) => {
  clearTimeout(context.handler);

  //   console.log("cancel-->", point.clientX, point.clientY);
};
