/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-11-10 11:24:23
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-10 11:51:03
 */
const getJSON = function (url) {
  const promise = new Promise(function (resolve, reject) {
    const handler = function () {
      console.log("111", this);
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();
  });

  return promise;
};

getJSON("/posts.json").then(
  function (json) {
    console.log("Contents: " + json);
  },
  function (error) {
    console.error("出错了", error);
  }
);
