/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-12-31 16:07:14
 * @LastEditors: liuyun03
 * @LastEditTime: 2021-01-05 09:15:08
 */
let http = require("http");
let fs = require("fs");

let request = http.request(
  {
    hostname: "127.0.0.1",
    port: 8882, // 发到虚拟机是哪个
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
  },
  (response) => {
    console.log(response);
  }
);

let file = fs.createReadStream("./sample.html");

file.on("data", (chunk) => {
  console.log(chunk.toString());
  request.write(chunk);
});

file.on("end", (chunk) => {
  console.log("read finished");
  request.end(chunk);
});

request.end();
