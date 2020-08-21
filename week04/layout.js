/** 对style进行预处理：
 * 1. 用px标识对属性变成纯粹的数字
 * 2. 纯数字转一下类型
 */
function getStyle(element) {
  if (!element.style) {
    element.style = {};
  }

  for (let prop in element.computedStyle) {
    console.log(prop);
    var p = element.computedStyle.value;
    element.style[prop] = element.computedStyle[prop].value;

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }

    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
  }
  return element.style;
}

function layout(element) {
  if (!element.computedStyle) {
    return;
  }

  var elementStyle = getStyle(element);

  if (elementStyle.display !== "flex") {
    return;
  }

  var items = element.children.filter(e => e.type === "element");

  /** TODO: 这里为什么要进行排序，order是哪里来的 */
  items.sort(function(a, b) {
    return (a.order || 0) - (b.order || 0);
  });

  // 取出style属性，处理主轴和交叉轴
  var style = elementStyle;

  ["width", "height"].forEach(size => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });

  if (!style.flexDirection || style.flexDirection === "auto") {
    style.flexDirection = "row";
  }
  if (!style.alignItems || style.alignItems === "auto") {
    style.flexDirection = "stretch";
  }
  if (!style.justifyContent || style.justifyContent === "auto") {
    style.flexDirection = "flex-start";
  }
  if (!style.flexWrap || style.flexWrap === "auto") {
    style.flexDirection = "nowrap";
  }
  if (!style.alignContent || style.alignContent === "auto") {
    style.flexDirection = "stretch";
  }

  /**
   * mainSize：主轴尺寸，要么是宽 要么是高
   * mainStart mainEnd：最左缘、最右缘，受row|column对影响，它就可能是top和bottom， 同样，如果是row-reverse形式(从右往左)，这时start和end就要交换一下
   * mainSign：从左开始去加 可能是+1 或者 -1
   * mainBase：从左开始或者从右开始的值
   *
   * 交叉轴：
   * crossSize
   * crossStart
   * crossEnd
   */
  var mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSize,
    crossBase;

  if (style.flexDirection === "row") {
    mainSize = "width"; // 主轴尺寸，要么是宽 要么是高
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1;
    mainBase = 0;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1;
    mainBase = style.width;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1;
    mainBase = 0;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1;
    mainBase = style.height;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  /** 反向换行：
   * 需要交换交叉轴的开始和结束
   * crossSize 改为 -1
   */
  if (style.flexWrap === "wrap-reverse") {
    var tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSize = -1;
  } else {
    crossBase = 0;
    crossSize = 1;
  }

  // 如果父元素没有设置主轴尺寸，比如主轴是width属性，那么父元素是没有width的，那么就会进入一个AutoMainSize模式(父元素没有设置主轴尺寸，所以由主轴撑开，这种情况下，它的尺寸无论如何也不会超)
  var isAutoMainSize = false;
  if (!style[mainSize]) {
    // auto sizing
    style[mainSize] = 0;
    // 把所有的子元素的mainSize加起来就是主轴的size
    for (var i = 0; i < items.length; i++) {
      let itemStyle = getStyle(items[i]);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] != void 0) {
        style[mainSize] = itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  // 把元素收集进行
  var flexLine = [];
  var flexLines = [flexLine];

  var mainSpace = elementStyle[mainsize]; // 剩余空间 = 元素的父元素的mainSize，即主轴尺寸
  var crossSpace = 0;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemStyle = getStyle(item);

    if (itemStyle[mainStyle] === null) {
      itemStyle[mainSize] = 0;
    }

    // 只要当前元素由flex就认为是可伸缩的，因为可伸缩，所以肯定可以放进行里
    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      // 如果是autoMainSize，每个元素直接放进去即可
      mainSpace -= itemStyle[mainSize];
      // 如果item的交叉轴尺寸不等于null，crossSpace需要取最大交叉轴的尺寸
      if (itemStyle[crossSize] !== null && itemStyle[crossSi]) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }

      flexLine.push(item);
    } else {
      // 换行逻辑
      // 如果元素比父元素尺寸大，需要把把父元素尺寸赋值给当前元素的尺寸
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }
      // 如果主轴尺寸里面剩下的空间不足以容纳每一个元素，需要换行策略，需要给当前行存上以下属性
      if (mainSpace < itemStyle[mainSize]) {
        // 主轴
        flexLine.mainSpace = mainSpace;
        // 交叉轴
        flexLine.crossSpace = crossSpace;
        // 创建一个新的flexLine
        flexLine = [item];
        flexLines.push(flexline);
        // 重制mainSpace和crossSpace
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        // 如果能放下，就直接放进行
        flexLine.push(item);
      }
      // mainSpace计算：计算主轴和交叉轴的尺寸
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }

  flexLine.mainSpace = mainSpace;
  console.log("items:", items);

  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // 若剩余空间为负数，所有flex元素为0，等比压缩(根据主轴size压缩的)剩余元素 overflow (happens only if container is single line), scale every item
    var scale = style[mainSize] / (style[mainSize] - mainSpace);
    var currentMain = mainBase;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);

      // flex元素是不参加等比压缩的
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      // 有主轴尺寸的就乘以一个scale
      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] =
        itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      // 把当前的位置设置成上一个元素的mainEnd
      currentMain = itemStyle[mainEnd];
    }
  } else {
    // 多行 process each flex line
    flexLines.forEach(function(items) {
      var mainSpace = items.mainSpace;
      var flexTotal = 0;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        // 有flex items，那么元素就会占满整行, justifyContent用不上
        var currentMain = mainBase;
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var itemStyle = getStyle(item);

          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        // 无flex items, 需要把主轴方向的剩余空间，根据justifyContent规则进行分配
        if (style.justifyContent === "flex-start") {
          // 元素之间无间隔
          var currentMain = mainBase;
          var step = 0;
        }

        if (style.justifyContent === "flex-end") {
          // 元素之间无间隔
          var currentMain = mainSpace * mainSign + mainBase;
          var step = 0;
        }

        if (style.justifyContent === "center") {
          // 元素之间无间隔
          var currentMain = (mainSpace / 2) * mainSign + mainBase;
          var step = 0;
        }

        if (style.justifyContent === "space-between") {
          // 元素之间有items.length - 1的间隔
          var step = mainSpace / (items.length - 1) + mainBase;
          var currentMain = mainBase;
        }

        if (style.justifyContent === "space-around") {
          // 元素之间间隔正好有元素那么多的间隔
          var step = mainSpace / items.length + mainBase;
          var currentMain = step / 2 + mainBase;
        }

        for (var i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign + itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }
}

module.exports = layout;
