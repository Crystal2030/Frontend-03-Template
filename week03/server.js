/**
* @description: description
* @author: liuyun03
* @Date: 2020-08-12 23:31:10
* @LastEditors: liuyun03
* @LastEditTime: 2020-08-12 23:33:59
 */
/*
 * @Author: your name
 * @Date: 2020-08-06 23:55:23
 * @LastEditTime: 2020-08-06 23:58:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /Frontend-03-Template/week02/server.js
 */
const http = require('http');

http.createServer((request, response) => {
    let body = [];
    request.on('error', (err) => {
        console.log(err);
    }).on('data', (chunk) => {
        body.push(chunk.toString());
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log("body", body);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(
            `<html meta=a >
             <head>
                <style>
                    body div #myid {
                        width: 100px;
                        background-color: #ff5000;
                    }
                    body div img {
                        width: 30px;
                        background-color: #ff1111;
                    }
                </style>
             </head>
             <body>
                <div>
                    <img id="myid" />
                    <img />
                </div>
             </body>
            `
        );
    })
}).listen(8008);

console.log('server started');