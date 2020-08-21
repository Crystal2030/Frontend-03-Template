/** 对style进行预处理：
 * 1. 用px标识对属性变成纯粹的数字
 * 2. 纯数字转一下类型
 */
function getStyle(element) {
    if(!element.style) {
        element.style  = {};
    }

    for(let prop in element.computedStyle) {
        console.log(prop);
        var p = element.computedStyle.value;
        element.style[prop] = element.computedStyle[prop].value;

        if(element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }

        if(element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    return element.style;
}

function layout(element) {
    if(!element.computedStyle) {
        return;
    }

    var elementStyle = getStyle(element);

    if(elementStyle.display !== 'flex') {
        return;
    }

    var items = element.children.filter(e => e.type === 'element');

    /** TODO: 这里为什么要进行排序，order是哪里来的 */
    items.sort(function(a,b) {
        return (a.order || 0) - (b.order || 0);
    });

    // 取出style属性，处理主轴和交叉轴
    var style = elementStyle;

    ['width', 'height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    })

    if(!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row';
    }
    if(!style.alignItems || style.alignItems === 'auto') {
        style.flexDirection = 'stretch';
    }
    if(!style.justifyContent || style.justifyContent === 'auto') {
        style.flexDirection = 'flex-start';
    }
    if(!style.flexWrap || style.flexWrap === 'auto') {
        style.flexDirection = 'nowrap';
    }
    if(!style.alignContent || style.alignContent === 'auto') {
        style.flexDirection = 'stretch';
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
    var mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSize, crossBase;

    if(style.flexDirection === 'row') {
        mainSize = 'width'; // 主轴尺寸，要么是宽 要么是高
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if(style.flexDirection === 'row-reverse') {
        mainSize = 'width'; 
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }


    if(style.flexDirection === 'column') {
        mainSize = 'height'; 
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if(style.flexDirection === 'column-reverse') {
        mainSize = 'height'; 
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    /** 反向换行：
     * 需要交换交叉轴的开始和结束
     * crossSize 改为 -1
     */
    if(style.flexWrap === 'wrap-reverse') {
       var tmp = crossStart;
       crossStart = crossEnd;
       crossEnd = tmp;
       crossSize = -1;
    } else {
        crossBase = 0;
        crossSize = 1;
    }

}

module.exports = layout;