/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-08-05 22:05:58
* @LastEditors: liuyun03
* @LastEditTime: 2020-08-06 21:57:06
 */
function findAB(str) {
  let flagA = false;
  for (let s of str) {
    if (s === "a") {
      flagA = true;
    } else if (flagA && s === "b") {
      return true;
    } else {
      flagA = false;
    }
  }
  return false;
}

function findABCDEF(str) {
  let flagA = false;
  let flagB = false;
  let flagC = false;
  let flagD = false;
  let flagE = false;
  for (let s of str) {
    if (s === "a") {
      flagA = true;
    } else if (flagA && s === "b") {
      flagB = true;
    } else if (flagA && flagB && s === "c") {
      flagC = true;
    } else if (flagA && flagB && flagC && s === "d") {
      flagD = true;
    } else if (flagA && flagB && flagC && flagD && s === "e") {
      flagE = true;
    } else if (flagA && flagB && flagC && flagD && flagE && s === "f") {
      return true;
    } else {
      flagA = false;
      flagB = false;
      flagC = false;
      flagD = false;
      flagE = false;
    }
  }
  return false;
}


