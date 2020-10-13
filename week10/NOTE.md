1. 词法分析（Lexical Analysis）

有了产生式之后，我们就要从表达式中拆分出「终结符」，也就是 `<Number>` 和各种符号（|| && + - \* / ()）。

在做正式的拆分之前，我们先要来分析一个四则运算还哪些词法。如，1024.1024 \* 10 + 25 就有 4 种 Token。

```
TokenNumber: 0 1 2 3 4 5 6 7 8 9 . 的组合
Operator: + - \* / 之一
Whitespace: <SP>
LineTerminator: <LF>、<CR>
```

这个过程其实就是将一串文本拆分成一个个的单词（Token），也就是「词法分析」。

我们在之前学习了 此处为语雀文档，点击链接查看：https://www.yuque.com/wendraw/fe/fsm 并且在 Toyed Browser 解析了 HTML 文本 ，然后我们又在上一篇学习了 JavaScript 中的 此处为语雀文档，点击链接查看：https://www.yuque.com/wendraw/fe/regular。因此我们就有两种方法拆分终结符。

正则表达式

词法分析如果用正则来做的话，就非常简单了。我们利用正则 () 捕获规则，就可以直接将对应的 Token 直接拆出来。

```
<script>
      let regexp = /((?:0|[1-9][0-9]*)\.[0-9]*|(?:0|[1-9][0-9]*))|([ ]+)|([\r\n]+)|(\+)|(\-)|(\*)|(\/)/g;
      const dictionary = [
        "Number",
        "Whitespace",
        "LineTerminator",
        "+",
        "-",
        "*",
        "/",
      ];
      function tokenize(source) {
        var result = null;
        while (true) {
          result = regexp.exec(source);
          if (!result) break;
          for (var i = 1; i <= dictionary.length; i++) {
            if (result[i]) {
              console.log(dictionary[i - 1]);
            }
          }
          console.log(result);
        }
      }
      tokenize("1024 + 10 * 25");
    </script>
```

1. 语法分析

有了 Token 之后我们就可以进行「语法分析」了，语法分析就是在词法分析的基础之上得到程序的语法结构。这个结构是一棵树，一般叫做「抽象语法树（Abstract Syntax Tree）」，简称 AST。

既然是要构建一棵树，我们就有两种方法。一种是自顶向下，向下扫描 Token 串，构建它的子节点。另一种是自底向上，先将最下面的叶子节点识别出来，然后再组装上一级节点。

也就是说语法分析一般有两种算法，它们分别对应的就是 LL 和 LR。

LL 分析器是一种处理某些上下文无关文法的自顶向下分析器。因为它从左（Left）到右处理输入，再对句型执行最左推导出语法树（Left derivation，相对于 LR 分析器）。能以此方法分析的文法称为 LL 文法。

LR 分析器是一种自底向上（bottom-up）的上下文无关语法分析器。LR 意指由左（Left）至右处理输入字符串，并以最右边优先派生（Right derivation）的推导顺序（相对于 LL 分析器）建构语法树。能以此方式分析的语法称为 LR 语法。而在 LR(k) 这样的名称中，k 代表的是分析时所需前瞻符号（lookahead symbol）的数量，也就是除了目前处理到的输入符号之外，还得再向右引用几个符号之意；省略 （k）时即视为 LR(1)，而非 LR(0)。

生成 MultiplicationExpression
我们先来生成一个乘法表达式，在前面的产生式中，`<Number>` 是一个终结符，而 `<MultiplicationExpression>` 是一个非终结符。

```
    <MultiplicationExpression> ::=
    <Number> |
    <MultiplicationExpression> "\*" <Number> |
    <MultiplicationExpression> "/" <Number>
```

```
function MultiplicativeExpression(source) {
        if (source[0].type === "Number") {
          let node = {
            type: "MultiplicativeExpression",
            children: [source[0]],
          };
          source[0] = node;
          return MultiplicativeExpression(source);
        }
        if (
          source[0].type === "MultiplicativeExpression" &&
          source[1] &&
          source[1].type === "*"
        ) {
          let node = {
            type: "MultiplicativeExpression",
            operator: "*",
            children: [],
          };
          // shift删除第一个元素并返回该元素的值
          node.children.push(source.shift());
          node.children.push(source.shift());
          node.children.push(source.shift());
          source.unshift(node);
          return MultiplicativeExpression(source);
        }
        if (
          source[0].type === "MultiplicativeExpression" &&
          source[1] &&
          source[1].type === "/"
        ) {
          let node = {
            type: "MultiplicativeExpression",
            operator: "/",
            children: [],
          };
          node.children.push(source.shift());
          node.children.push(source.shift());
          node.children.push(source.shift());
          source.unshift(node);
          return MultiplicativeExpression(source);
        }
        if (source[0].type === "MultiplicativeExpression") {
          return source[0];
        }
        return MultiplicativeExpression(source);
      }
```

multiplicativeExpression() 函数其实是与产生式一一对应的。

if (tokens[0].type === "Number") 分支对应产生式的第一层，就是表示如果来的是一个 Number，直接将它重新包装成一个 MultiplicativeExpression 放进 tokens 中，然后将 tokens 放进 multiplicativeExpression 递归调用，因为 后面还可能有 MultiplicativeExpression，乘法表达式是可以嵌套的。

if (tokens[0].type === "MultiplicativeExpression" && tokens.length > 1 && tokens[1].type === "_") 分支对应产生式的第二层，在 MultiplicativeExpression 之后要跟上一个 _，并且在 \* 之后需要是一个 Number，如果不是就表示表达式有误，要抛出错误。

if (tokens[0].type === "MultiplicativeExpression" && tokens.length > 1 && tokens[1].type === "/") 分支对应产生式的第三层，跟第二层的操作一样。

最后 if (tokens[0].type === "MultiplicativeExpression") 就是前面的条件都不满足。

如果进来的 Token 是 MultiplicativeExpression，但是后面的 Token 不认识（不是 \* 或者 /），或者后面没有 Token。就说明乘法表达式已经构建完成了，并且存在 tokens[0]，直接返回即可。

如果进来的第一个 Token 不是 Number 或 MultiplicativeExpression，那么这个乘法表达式就是不合法的，我们直接抛出错误。

生成 AdditiveExpression
有了 MultiplicativeExpression 之后我们就可以来生成 AdditiveExpression（加法表达式）。加法表达式的产生式就是：

```
<AdditionExpression> ::=
    <MultiplicationExpression> |
    <AdditionExpression> "+" <MultiplicationExpression> |
    <AdditionExpression> "-" <MultiplicationExpression>
```

其实这个产生式的 `<MultiplicationExpression>` 还可以展开的，因此一个加法表达式的第一个输入值就有 三种可能 `<Number>`、`<MultiplicationExpression>` 和 `<AdditionExpression>`。

```
function AdditiveExpression(source) {
        if (source[0].type === "MultiplicativeExpression") {
          let node = {
            type: "AdditiveExpression",
            children: [source[0]],
          };
          source.unshift(node);
          return node;
        }
        if (
          source[0].type === "AdditiveExpression" &&
          source[1] &&
          source[1].type === "+"
        ) {
          let node = {
            type: "AdditiveExpression",
            operator: "+",
            children: [],
          };
          // shift删除第一个元素并返回该元素的值
          node.children.push(source.shift());
          node.children.push(source.shift());
          MultiplicativeExpression(source);
          node.children.push(source.shift());
          source.unshift(node);
          return AdditiveExpression(source);
        }
        if (
          source[0].type === "AdditiveExpression" &&
          source[1] &&
          source[1].type === "-"
        ) {
          let node = {
            type: "AdditiveExpression",
            operator: "-",
            children: [],
          };
          node.children.push(source.shift());
          node.children.push(source.shift());
          MultiplicativeExpression(source);
          node.children.push(source.shift());
          source.unshift(node);
          return AdditiveExpression(source);
        }
        if (source[0].type === "AdditiveExpression") {
          return source[0];
        }
        MultiplicativeExpression(source);
        return AdditiveExpression(source);
      }
```

首先是 if (tokens[0].type === "Number") 分支，如果进来的是一个 Number，我们直接传给 multiplicativeExpression() 函数，让它来将 Number 及其后面可能的 \* / 表达式包装成 `<MultiplicativeExpression>`。

if (tokens[0].type === "MultiplicativeExpression") 分支就是上面产生式的第一层，遇到这个我们就可以直接将其包装成 AdditiveExpression 的 Token。

if (tokens[0].type === "AdditiveExpression" && tokens.length > 1 && tokens[1].type === "+") 分支对应的就是产生式的第二层，AdditiveExpression 后面跟上了一个 "+" 终结符。这时候我们仍然是生成一个  AdditiveExpression 的 Token，不过 + 后面是要跟上一个 `<MultiplicativeExpression>`，因此只能先将 AdditiveExpression 和 + 的 token 放到 children 里。+ 后面的 token 再用 multiplicativeExpression() 函数包装成 `<MultiplicativeExpression>` 再放到 children 里。至此一个 "+" 的 AdditiveExpression 就生成了。

if (tokens[0].type === "AdditiveExpression" && tokens.length > 1 && tokens[1].type === "+") 分支对应的是产生式的第三层，处理方法跟上面是一样的。

生成 Expression
最后就是要生成一个表达式的 AST。因为我们的 Token 其实还剩下 EOF 没有处理，我们要处理到 EOF 这个表达式才算完整。

```
function Expression(source) {
        if (
          source[0].type === "AdditiveExpression" &&
          source[1] &&
          source[1].type === "EOF"
        ) {
          let node = {
            type: "Expression",
            children: [source.shift(), source.shift()],
          };
          source.unshift(node);
          return node;
        }
        AdditiveExpression(source);
        return Expression(source);
      }
```

这部分的代码其实也比较简单，就是生成整棵树的顶点。

当第一个 token 是 AdditiveExpression 并且第二个 token 是 EOF。那就说明整个表达式解析完了，就直接将它们包装成 Expression 返回即可。如果还没结束就要继续交给 additiveExpression() 函数来生成加法表达式。
