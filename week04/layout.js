/** 对style进行预处理：
 * 1. 用px标识对属性变成纯粹的数字
 * 2. 纯数字转一下类型
 */
function getStyle(element) {
  if (!element.style) {
    element.style = {};
  }

  if (Object.keys(element.style).length > 0) {
    return element.style;
  }

  for (let prop in element.computedStyle) {
    element.style[prop] = element.computedStyle[prop].value;

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
    if (prop.indexOf("-") !== -1) {
      let list = prop.split("-");
      let camelProp = list[0];
      for (let i = 1; i < list.length; i++) {
        camelProp = camelProp + list[i][0].toUpperCase() + list[i].slice(1);
      }
      element.style[camelProp] = element.style[prop];
    }
  }
  return element.style;
}

function layout(element) {
  if (!element.computedStyle) {
    return;
  }

  let elementStyle = getStyle(element);

  if (elementStyle.display !== "flex") {
    return;
  }

  let items = element.children.filter(e => e.type === "element");

  items.sort((a, b) => {
    return (a.style.order || 0) - (b.style.order || 0);
  });

  // 取出style属性，处理主轴和交叉轴
  let style = elementStyle;

  ["width", "height"].forEach(size => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });

  if (!style.flexDirection || style.flexDirection === "auto") {
    style.flexDirection = "row";
  }
  if (!style.alignItems || style.alignItems === "auto") {
    style.alignItems = "stretch";
  }
  if (!style.justifyContent || style.justifyContent === "auto") {
    style.justifyContent = "flex-start";
  }
  if (!style.flexWrap || style.flexWrap === "auto") {
    style.flexWrap = "nowrap";
  }
  if (!style.alignContent || style.alignContent === "auto") {
    style.alignContent = "stretch";
  }

  let mainSize, // 主轴尺寸 width height
    mainStart, // 主轴开始位置 left right top bottom
    mainEnd, // 主轴结束位置 left right top bottom
    mainSign, // 主轴符号位 +1 -1
    mainBase, // 主轴开始位置值 0 style.width style.height
    crossSize, // 交叉轴尺寸 width height
    crossStart, // 交叉轴开始位置 left right top bottom
    crossEnd, // 交叉轴结束位置 left right top bottom
    crossSign, // 交叉轴符号位 +1 -1
    crossBase; // 交叉轴开始位置值 0 style.width style.height

  if (style.flexDirection === "row") {
    mainSize = "width";
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

  if (style.flexWrap === "wrap-reverse") {
    let temp = crossStart;
    crossStart = crossEnd;
    crossEnd = temp;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  // 如果父元素没有设置主轴尺寸，比如主轴是width属性，那么父元素是没有width的，那么就会进入一个AutoMainSize模式(父元素没有设置主轴尺寸，所以由主轴撑开，这种情况下，它的尺寸无论如何也不会超)
  let isAutoMainSize = false;
  // 父元素没有设置主轴尺寸的时候，由子元素的mainSize相加
  if (!style[mainSize]) {
    style[mainSize] = 0;
    // 把所有的子元素的mainSize加起来就是主轴的size
    for (let i = 0; i < items.length; i++) {
      let itemStyle = getStyle(items[i]);
      if (itemStyle[mainSize] !== null && itemStyle[mainSize] !== void 0) {
        style[mainSize] += itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  // 把元素收集进行
  let flexLine = [];
  let flexLines = [flexLine];

  let mainSpace = style[mainSize]; // 剩余空间 = 元素的父元素的mainSize，即主轴尺寸
  let crossSpace = 0;

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let itemStyle = getStyle(item);

    if (itemStyle[mainSize] === null) {
      itemStyle[mainSize] = 0;
    }

    // 只要当前元素由flex就认为是可伸缩的，因为可伸缩，所以肯定可以放进行里
    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" || isAutoMainSize) {
      // 如果是autoMainSize，每个元素直接放进去即可
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
        // 最大的交叉轴尺寸
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      // style.flexWrap === 'wrap'
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }
      if (mainSpace < itemStyle[mainSize]) {
        // mainSpace、crossSpace保存在旧的一行里
        // 换行逻辑
        // 如果元素比父元素尺寸大，需要把把父元素尺寸赋值给当前元素的尺寸if (itemStyle[mainSize] > style[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        // 重置mainSpace和crossSpace
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
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
      style[crossSize] !== void 0 ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // 若剩余空间为负数，所有flex元素为0，等比压缩(根据主轴size压缩的)剩余元素 overflow (happens only if container is single line), scale every item
    let scale = style[mainSize] / (style[mainSize] - mainSpace);
    let currentMain = mainBase;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

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
    flexLines.forEach(items => {
      let mainSpace = items.mainSpace;
      let flexTotal = 0;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        // 有flex items，那么元素就会占满整行, justifyContent用不上
        let currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

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
        let step = 0;
        if (style.justifyContent === "flex-start") {
          currentMain = mainBase;
          step = 0;
        }
        if (style.justifyContent === "flex-end") {
          currentMain = mainSpace * mainSign + mainBase;
          step = 0;
        }
        if (style.justifyContent === "center") {
          currentMain = (mainSpace / 2) * mainSign + mainBase;
          step = 0;
        }
        if (style.justifyContent === "space-between") {
          // 首尾没有间隔
          currentMain = mainBase;
          step = (mainSpace / (items.length - 1)) * mainSign;
        }
        if (style.justifyContent === "space-around") {
          // 首尾间隔均为step的一半
          step = (mainSpace / items.length) * mainSign;
          currentMain = step / 2 + mainBase;
        }
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }

  // let crossSpace

  //计算交叉轴
  if (!style[crossSize]) {
    crossSpace = 0;
    style[crossSize] = 0;
    for (let i = 0; i < flexLines.length; i++) {
      style[crossSize] += flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }

  if (style.flexWrap === "wrap-reverse") {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }
  // let lineSize = style[crossSize] / flexLines.length

  let step;
  if (style.alignContent === "flex-start") {
    crossBase += 0;
    step = 0;
  }
  if (style.alignContent === "flex-end") {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  if (style.alignContent === "center") {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }
  if (style.alignContent === "space-between") {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignContent === "space-around") {
    step = crossBase / flexLines.length;
    crossBase += (crossSign * step) / 2;
  }
  if (style.alignContent === "stretch") {
    crossBase += 0;
    step = 0;
  }

  flexLines.forEach(items => {
    // 交叉轴尺寸
    let lineCrossSize =
      style.alignContent === "stretch"
        ? items.crossSpace + crossSpace / flexLines.length
        : items.crossSpace;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

      let align = itemStyle.alignSelf || style.alignItems;

      if (item === null) {
        itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
      }
      if (align === "flex-start") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === "flex-end") {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossStart] =
          itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }
      if (align === "center") {
        itemStyle[crossStart] =
          crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === "stretch") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          crossBase + crossSign * (itemStyle[crossSize] || lineCrossSize);

        itemStyle[crossSize] =
          crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });
}

module.exports = layout;
