
/**
 * 1. 设计一个HTTP轻轻对累
 * 2. content type是一个必要对字段，要有默认值
 * 3. body是KV格式
 * 4. 不同对content-type影响body对格式
 */
const net = require('net');

class Request {
    constructor(options) {
        this.method = options.method || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.headers = options.headers || {};
        if(!this.headers['Content-Type']) {
            this.headers['Content-Type'] = "application/x-www-form-urlencoded";
        }
        if(this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`.join('&'));
        }
        this.headers['Content-Length'] = this.bodyText.length;
    }

    /**
     * send函数：
     * 1. 在Request对构造器中收集必要信息
     * 2. 设计一个send函数，把轻轻真是发送到服务器
     * 3. send函数应该是一步对，所以返回Promise
     */
    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            if(connection) {
                connection.write(this.toString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                })
                connection.on('data', data => {
                    console.log(data.toString());
                    parser.receive(data.toString());
                    if(parser.isFinished) {
                        resolve(parser.response);
                        connection.end();
                    }
                })
                connection.on('error', err => {
                    reject(err);
                    connection.end();
                })
            }
        });
    }
}


class ResponseParser {
    constructor() {

    }
    receive(string) {
        for(let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    receiveChar(char) {

    }
}



void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            ['x-Foo2']: 'customed'
        },
        body: {
            name: 'crystal'
        }
    })
    let reponse = await request.send();
    console.log( response)
}