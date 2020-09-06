## CSS 排版|盒

- HTML 代码中可以书写开始**标签**，结束**标签** ，和自封闭\_标签\_\_\_ 。
- 一对起止**标签** ，表示一个**元素** 。
- DOM 树中存储的是\_元素\_\_\_和其它类型的节点（Node）。
- CSS 选择器选中的是**元素** 。
- CSS 选择器选中的**元素** ，在排版时可能产生多个\_盒\_\_\_ 。
- 排版和渲染的基本单位是**盒** 。

- content-box: 盒的排版占用的区块=width + padding + border + margin
- border-box（包含了 padding 和 border）: 盒的排版占用的区块 = width + margiin

## CSS 排版|正常流排版

- 收集盒进行
- 计算盒在行中排布
- 计算行的排布
- 具体排布规则：
  > 当盒和文字在一行里面，是从左向右排布的，这就意味着它的文字和盒有一个对齐> 规则。一行里面有可能包含文字、图片、图标等等，这就叫 inline-level-box> （行内级别的盒）
  > 当一些大块元素，需要单独占一行，是 block-level-box。
  > 文字和 inline leve 的 box 排出来的行称为行盒 line-box
  > 正常流里面是一个个的 line-box 盒 block-level-box 从上到下的排布，每个行盒> 的内部是从左到右的排布。
  > 从上往下排布的上下文叫 BFC(block-level-formatting-context, 块级格式化上下文)，从左往右排布的上下文叫 IFC(inline-level-formatting-context, 行内格式化上下文)

## CSS 排版|正常流的行级排布

- baseline：任何语言都有一个基线对齐的规则，不同国家依赖的基线位置不一样，中文和英文混排的话，中文可能在这个基线上产生一个偏移，一般我们认为中文叫方块字，中文字会以文字的上缘和下缘作为基准线去对齐的，但是并不妨碍中文基于 baseline 对齐的，只是带了一定的偏移
- Text：任何一个文字都有一个宽和高，除此之外，它还有一条基线的定义。
  横排：左图所示，origin 圆点标识的位置就是文字的基线的位置，以基线的原点作为一个坐标，然后来定义文字的位置。如果基线是 x=0，那么它有一个的 xMax 和 yMax，这张图中 yMin 的相反数就是基线到字的底缘的距离，bearingX 决定了一个默认的字间距，advance 是字符整个占的空间，做排版的话，一个字占的空间=advance 的空间。
  纵排：右图所示
- 行模型：

  > base-line 和 文字的顶缘和底缘分别叫做 base-line text-top 和 > text-bottom，主要字体的大小不变，text-top 和 text-bottom 是不会发生变化> 的，如果使用多种字体混排，那么 text-top 和 text-bottom 是由 fontSize 最大的> 字体决定的
  > 文字的上缘和下缘可用理解为两条固定的线，如果行高大于文字的高度，还会有> line-top 和 line-bottom
  >
  > 如果只有文字的话，行模型就是下图所示了，再加上点 sub sup 比较稀有的位置
  >
  > 一旦涉及到跟盒的混排，会涉及到 line-top 盒 line-bottom 的偏移的问题，当我们的盒足够大时，比如盒从 text-bottom 对齐的，那么文字可能把高度撑开，此时，line-top 就从虚线的位置移动到白色的实线位置，这个现象是处理行模型非常麻烦的现象，盒的先后顺序盒尺寸都会影响 line-top 和 line-bottom 的位置，但>是盒不会影响 text-top 盒 text-bottom

- 代码演示：以下放了一个文字和有宽有高的 inline 的 block 的 div，默认是基线对齐规则的，盒的下边缘盒与基线对齐

```
<div style="font-size: 50px; line-height: 100px; background-color: pink;">
      <span>Hello good中文</span>
      <div style="line-height: 70px; width: 100px; height: 150px; background-color: aqua; display: inline-block;"></div>
  </div>
```

一旦 inline 的 block 里面加了文字，基线的位置变成了 inline-block 里面文字的最后一行的基线

```
<div style="font-size: 50px; line-height: 100px; background-color: pink;">
        <span>Hello good中文</span>
        <div style="line-height: 70px; width: 100px; height: 150px; background-color: aqua; display: inline-block;">c</div>
    </div>
```
> 注意：行内盒inline-block的基线随着自己里面的文字的变化而变化的，所以不建 议给行内盒使用基线对齐的。可以给一个vertical-align, 一般vertical-align会给一个top|bottom|middle，top就会跟行的顶缘对齐，bottom会跟行底缘对齐，middle就会跟行的中心线对齐。 
因为top 和 bottom会随着行的撑开而变化的，实际行模型就会比较复杂

## CSS排版|正常流的块级排布
- float：行盒的宽度会根据float产生的占据的宽度进行调整，它会影响生成的这些行盒的尺寸，当一个float元素出现后，它不止影响自己所在行，凡是它的高度所占据的范围内的行盒都会根据float元素的尺寸调整自己的大小
- margin折叠: 一个BFC里面有两个元素都有margin，这两个元素会发生一个堆叠的想象，最后叠出来的高度是跟最大的margin的高度相等的，这个现象叫做margin collapse（留白的折叠现象，也叫边距折叠, 边距折叠只会发生在同一个BFC中）正常流里只有BFC中会发生margin collapse，IFC中不会发生margin collapse

## CSS排版|BFC合并
- Block
  - Block Container：里面有BFC的 （所有可以容纳里面不是特殊的display的模式的，它里面默认就是正常流）
  - 能容纳正常流的盒，里面就有BFC，想想有哪些？
    - block
    - inline-block
    - table-cell
    - flex item
    - grid cell
    - table-caption
  - Block-level Box：外面有BFC的
    - block level: 
      - display: block
      - display: flex
      - display: table
      - display: grid
      - ...
    - Block Box = Block Container + Block-level Box：里外都有BFC的
- 设立BFC
  - floats
  - absolutely positioned elements
  - block containers (such as inline-blocks, table-cells, and table-captions) that are not block boxes
    - flex items
    - grid cell
    - ......
  - BFC合并：默认能容纳正常流的盒都会创建BFC，block box && overflow是visible例外，这种会发生BFC合并
    -  BFC合并(block box && overflow:visible)之后的影响
       -  BFC合并与float
       -  BFC合并与边距折叠
  
## CSS 排版|Flex排版
 - 收集盒进行
 - 计算盒在主轴方向的排布
 - 计算盒在交叉轴方向的排布  

## CSS动画与绘制 | 动画
 - animation属性
   - animation-name 时间曲线
   - animation-duration 动画的时长；
   - animation-timing-function 动画的时间曲线；
   - animation-delay 动画开始前的延迟；
   - animation-iteration-count 动画的播放次数；
   - animation-direction 动画的方向。
 - Transition
   - transition-property 要变换的属性；
   - transition-duration 变换的时长；
   - transition-timing-function 时间曲线；
     - cubic-bezier 贝塞尔曲线 https://cubic-bezier.com/#.39,1.65,.71,1.21 

## CSS动画与绘制 | 颜色

## CSS动画与绘制 | 绘制
 - 几何图形
   - border
   - border-shadow
   - border-radius
 - 文字
   - font
   - text-decoration
 - 位图
   - background-image

### 应用技巧
 1. data uri + svg
 2. data:image/svg+xml,<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg"><ellipse cs="300" cy="150" rx="200" ry="80" style="fill: rgb(200, 100, 50); stroke: rgb(0, 0, 100); stoke-width: 2"/></svg>

