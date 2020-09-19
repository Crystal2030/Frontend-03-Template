<!--
 * @Author: 刘云
 *
 * @Date: 2020-05-16 23:42:46
 * @Description: description
-->

## TicTacToe（井字棋）

> 井字棋是一个规则非常简单的小游戏，应该绝大部分的同学都玩过。就是在一个井字格里面画 X 和 O，谁先在横、竖、斜向上连成了一条线就赢了。

1. 第一步当然是把棋盘画出来

```
<div id="board"></div>
    <script>
      let pattern = [
        [2, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      let color = 1;

      console.log(pattern);

      function show() {
        let board = document.getElementById("board");
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText =
              pattern[i][j] === 2 ? "❌" : pattern[i][j] === 1 ? "⭕️" : "";
            board.appendChild(cell);
          }
          board.appendChild(document.createElement("br"));
        }
      }
      show(pattern);
    </script>
```

2.  第二步，给棋盘添加事件，交替落子：就是给每个格子 cell 加上 click 事件，然后在对应的位置画上对应的棋子即可

    ```
        function show() {
            let board = document.getElementById("board");
            // 绘制之前需要清空棋盘，然后重新绘制
            board.innerHTML = "";
            for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText =
            pattern[i][j] === 2 ? "❌" : pattern[i][j] === 1 ? "⭕️" : "";
            cell.addEventListener("click", () => move(j, i));
            board.appendChild(cell);
            }
            board.appendChild(document.createElement("br"));
            }
        }

        function move(x, y) {
        pattern[y][x] = color;
        // 让color从1变2，从2变1交替变化
        color = 3 - color;
        show();
        }
    ```

    小技巧：

    > pattern 数组还有一个小的编程技巧，就是我们是用 0 来表示没有放置棋子，用 1 来表示 ⭕️ 棋子，用 2 来表示 ❌ 棋子。用 1、2 来表示两种棋子，当需要处理交替落子时，我只需要用 3 -「当前棋子的值」，就得到了对方棋子的值。

3.  第三步：判断胜负，首先规则表明输赢有 6 条线，三横三纵两斜，任意一行满足同色，就获胜.

    ```
     <script>
    // ......
    function check(pattern, color) {
     for (let y = 0; y < 3; y++) {
       let win = true;
       for (let x = 0; x < 3; x++) {
         if (pattern[y * 3 + x] !== color) {
           win = false;
           break;
         }
       }
       if (win) return true;
     }

     for (let y = 0; y < 3; y++) {
       let win = true;
       for (let x = 0; x < 3; x++) {
         if (pattern[x * 3 + y] !== color) {
           win = false;
           break;
         }
       }
       if (win) return true;
     }

     {   // 正对角线
       let win = true;
       for (let i = 0; i < 3; i++) {
         if (pattern[i * 3 + i] !== color) {
           win = false;
           break;
         }
       }
       if (win) return true;
     }

     {   // 反对角线
       let win = true;
       for (let i = 0; i < 3; i++) {
         if (pattern[i * 3 + 2 - i] !== color) {
           win = false;
           break;
         }
       }
       if (win) return true;
     }

     return false;
    }
    </script>
    ```

4.  第四步：加入初步 AI 的能力，假设当前有一步能赢，我们把它挑出来，检查是不是要赢了，如果检查出来有一方要赢了，给出一个提示
    ```
        ...
        // 循环遍历上面每一个空节点，如果有一个空节点能让check变赢，那么久可用在willWin上去打上win了，但是如果willWin直接走这一步，然后执行check，原来的pattern就已经被破坏掉了，所以要写一个克隆函数
      function willWin(pattern, color) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            //如果当前位置不是空的，直接跳过去
            if (pattern[i][j]) {
              continue;
            }
            let tmp = clone(pattern);
            tmp[i][j] = color;
            if (check(tmp, color)) {
              return true;
            }
          }
        }
        return false;
      }
      ... 
    ```

    >需要考虑的就是 clone() 函数部分的代码，复制数据在 JS 中有非常多的选择。对于一维数组我们可以直接用 slice() 方法。当然如果是多维数组或者树形结构 slice 就搞不定了，不过我们可以借助 JSON 的「序列化」和「反序列化」，如， JSON.parse(JSON.stringify(pattern)) 也能得到一份新的数据 。

    > 我们用的是一维数组，所以可以利用 JS 的原型机制。直接以原数组为原型造一个新的对象。这个方法在 copy 的数据量大的时候，性能的优势非常大。这也是我们选择使用一维数组来存储数据的最大因素。
    ```
    function clone(pattern) {
        return Object.create(pattern);
    }
    ```

    我们在有一方落子之后就可以判断另一方是否直接赢了。
    ```
        function move(x, y) {
        // .....
        if (willWin(pattern, color)) {
            console.log(`${color === 2 ? "❌" : "⭕️"} will win!`);
        }
        }
    ```

5. Best Choice
  ```
    function bestChoice(pattern, color) {
        let p;
        if ((p = willWin(pattern, color))) {
          return {
            point: p,
            result: 1,
          };
        }

        // 默认值为-2：因为-2弱于任何一个这样的局面，即使输也不会比-2更差了
        let result = -2;
        let point = null;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            //如果当前位置不是空的，直接跳过去
            if (pattern[i][j]) {
              continue;
            }
            let tmp = clone(pattern);
            tmp[i][j] = color;
            let r = bestChoice(tmp, 3 - color).result;
            // 找到对方最差的点
            if (-r > result) {
              result = -r;
              point = [j, i];
            }
            // win-lost剪枝(胜负剪枝)：如果已经找到一个点可以赢了，就停止
            if (result === 1) {

            }  
          }
          return {
            point: point,
            result: point ? result : 0,
          };
        }
      }
  ```

  > 算法整体的思想就是，首先检查我方是不是快赢了（willWin），如果是，就直接结束了。如果不是，就再找对方可以赢的点，处理的方式就是遍历所有空位，并填上我方的棋子。然后在这个情况下查看对方的 bestChoice，再将对方的 result 与我们当前的 result 对比，对方最糟糕的选择对于我们来说就是最好的选择。保存当前的 point 和 result，再进行下一轮的寻找，在所有情况中找出最优的选择。

6. 剪枝
   ``` 
    // win-lost剪枝(胜负剪枝)：如果已经找到一个点可以赢了，就停止
        let result = -1;
        outer: for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if (pattern[i * 3 + j] !== 0) {
              continue;
            }
            let tmp = clone(pattern);
            tmp[i * 3 + j] = color;
            let opp = bestChoice(tmp, 3 - color);
            if (-opp.result >= result) {
              point = [j, i];
              result = -opp.result;
            }
            if (result === 1) {
              // 如果想break两层循环，需要外边加一个label
              break outer;
            }
          }
        }
        return {
          point: point,
          result: point ? result : 0,
        };
      }
   ```

   


## 异步编程
### 红绿灯问题
> 完成一个路口的红路灯，会按照绿灯亮 10 秒，黄灯亮 2 秒，红灯亮 5 秒的顺序无限循环。请编写 JavaScript 代码来控制这个红路灯。
1. 实现UI
  ```
  ... 
   <style>
        div{
            background-color: grey;
            display: inline-block;
            margin: 30px;
            width: 100px;
            height: 100px;
            border-radius: 50px;
        }
        .green.light {
            background-color: green;
        }
        .yellow.light {
            background-color: yellow;
        }
        .red.light {
            background-color: red;
        }
    </style>
    ...

    <div class="green"></div>
    <div class="yellow"></div>
    <div class="red"></div>

    <script>
        function green() {
            var lights = document.getElementsByTagName('div');
            for(var i =0;i<3;i++) {
                lights[i].classList.remove('light');
            }
            document.getElementsByClassName('green')[0].classList.add('light');
        }
        function red() {
            var lights = document.getElementsByTagName('div');
            for(var i =0;i<3;i++) {
                lights[i].classList.remove('light');
            }
            document.getElementsByClassName('red')[0].classList.add('light');
        }
        function yellow() {
            var lights = document.getElementsByTagName('div');
            for(var i =0;i<3;i++) {
                lights[i].classList.remove('light');
            }
            document.getElementsByClassName('yellow')[0].classList.add('light');
        }
        function go () {
            green();
            setTimeout(function() {
                yellow();
                setTimeout(function() {
                    red();
                    setTimeout(function() {
                        go();
                    }, 5000)
                }, 2000)
            }, 10000)
        }
    </script>
  ```
  green()、yellow()、red() 函数都是用 class 选择器来控制灯亮，并且都是点亮自己颜色的灯关闭别的颜色的灯。

2. 回调: 利用 setTimeout 来设置固定的时间，时间到了之后就执行对应的回调函数。
    ```
    function go () {
        green();
        setTimeout(function() {
            yellow();
            setTimeout(function() {
                red();
                setTimeout(function() {
                    go();
                }, 5000)
            }, 2000)
        }, 10000)
    }
    ```
3. Promise: 摆脱 setTimeout 这种回调地狱, 可以用 Promise 来包装 setTimeout，从而构造出一个 sleep 函数
   ```
    function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration)
    })
    }
   ```
   有了 sleep 之后我们可以来改造 go 函数了，Promise 给我们提供了链式调用的能力，每次 then 的回调函数中都可以返回一个 Promise 作为下一次 then 的输入。
   ```
    function go() {
    green();
    sleep(10000).then(() => {
        yellow();
        return sleep(2000);
    }).then(() => {
        red();
        return sleep(5000);
    }).then(() => {
        go();
    })
    }
   ```

4. async / await: 可以在 async 函数中用 await 关键字来等待一个 Promise，只有当 await 的 Promise 被返回是，后面的代码才会被执行
  ```
    async function go() {
    while (true) {
        green();
        await sleep(10000);
        yellow();
        await sleep(2000);
        red();
        await sleep(5000);
    }
    }
  ```
  while(true) 的无限循环里面不断的亮灯、sleep 一段时间、再亮灯
  可以用一个按钮来回切换不同的灯。就像交警手里的无线遥控器，会随时根据交通路况来切换灯。这样我们就可以用一个按钮来顺序切换不同的交通灯了。
  ```
    // ......
    function happen(element, eventName) {
        return new Promise((resolve, reject) => {
        element.addEventListener(eventName, resolve, { once: true });
        })
    }

    void async function manual() {
        while (true) {
        green();
        await happen(document.getElementById("next"), "click");
        yellow();
        await happen(document.getElementById("next"), "click");
        red();
        await happen(document.getElementById("next"), "click");
        }
    }()
  ```
5. 
