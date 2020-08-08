/**
* @description: 状态机处理: 作业：使用状态机完成”abababx”的处理。 
* @author: liuyun03
* @Date: 2020-08-06 21:57:02
* @LastEditors: liuyun03
* @LastEditTime: 2020-08-06 22:36:20
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
    } else if(c === 'a') {
        return foundA;
    }else {
        return start(c);
    }
}

function foundB(c) {
    if (c === 'x') { 
        return end;
    } else {
        return start(c);
    }
}

console.log(match('abababx'))