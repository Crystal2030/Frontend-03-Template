## 学习总结

### 本周学习
 > 本周学习了有限状态机，以及通过几个示例对比，能明显感觉出来状态机处理问题的方便灵活之处
 > 学习浏览器的工作原理，从一个url输入到浏览器发生的步骤是url解析-》HTML parse-》dom -》 dom with css -》dom with position -》 bitmap

### 总结
 > JS中实现状态机最好的办法就是使用函数，有限状态机在任一时刻，只出在一种状态，某种条件下，会从一种状态转变到另一种状态，对于js来说，很多对象是可以用来写成预先状态机的。根据课程练习能明细感受到有限状态机的写法，会是整个逻辑非常清晰，方便封装，一个对象状态越多，发生的事件越多，就越适使用状态机。
 > 了解了get关键字的用法，get语法将对象属性绑定到查找该属性时将调用的函数。
 > void async function() {}(): 利用 void 运算符让 JavaScript 引擎把一个function关键字识别成立即调用函数表达式而不是函数声明（语句）
 > 一个url输入到浏览器发生6个步骤：url解析-》HTML parse-》dom -》 dom with css -》dom with position -》 bitmap
 > 实现一个HTTP请求需要经过5步：
   - 第一步 设计一个HTTP请求的类
   - 第二步 实现send
   - 第三步 发送请求
   - 第四步 ResponseParser
   - 第五步 BodyParser





