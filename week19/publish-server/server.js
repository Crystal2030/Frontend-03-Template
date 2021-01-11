/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-12-31 16:04:45
 * @LastEditors: liuyun03
 * @LastEditTime: 2021-01-05 08:57:13
 */
let http = require("http");
let fs = require("fs");

http
  .createServer(function (request, response) {
    console.log(request.headers);

    let outFile = fs.createWriteStream("../server/pulbic/index.html");

    request.on("data", (chunk) => {
      console.log(chunk.toString());
      outFile.write(chunk);
    });
    request.on("end", () => {
      outFile.end();
      response.end("Success");
    });
  })
  .listen(8082);
