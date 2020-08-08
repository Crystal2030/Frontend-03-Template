/**
* @description: 状态机处理: 不准使用正则表达式，纯粹用 JavaScript 的逻辑实现：在一个字符串中，找到字符“abcdef”    
* @author: liuyun03
* @Date: 2020-08-06 21:57:02
* @LastEditors: liuyun03
* @LastEditTime: 2020-08-06 22:16:18
 */
function match(string) {
    let state = start;
    for (let c of string) {
        state = state(c);
    }
    return state === end;
}
function start(c) {
    if (c === 'a') {
        return foundA;
    } else {
        return start;
    }
}
function end(c) {
    return end;
}

function foundA(c) {
    if (c === 'b') { 
        return foundB;
    } else {
        return start(c);
    }
}

function foundB(c) {
    if (c === 'c') { 
        return foundC;
    } else {
        return start(c);
    }
}

function foundC(c) {
    if (c === 'd') { 
        return foundD;
    } else {
        return start(c);
    }
}
function foundD(c) {
    if (c === 'e') { 
        return foundE;
    } else {
        return start(c);
    }
}

function foundE(c) {
    if (c === 'f') { 
        return end;
    } else {
        return start(c);
    }
}

console.log(match('I am abcdefg'))