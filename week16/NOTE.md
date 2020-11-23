<!--
 * @description: description
 * @author: liuyun03
 * @Date: 2020-07-23 16:30:46
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-23 10:49:30
-->

## 应用动画与手势到轮播组件

轮播组件主要实现了自动轮播和鼠标控制轮播，这里把 2 种情况整合到一起，默认是自动轮播，鼠标点击或者说有手势操作的时候会取消自动轮播.
去掉之前 CSS 上的 transition

```
render() {
  ...
  let timeline = new Timeline()
  timeline.start()

  let handler = null
  let position = 0
  let nextPicture = () => {
    let children = this.root.children
    let nextPosition = (position + 1) % children.length

    let current = children[position]
    let next = children[nextPosition]

    timeline.add(
      new Animation(
        current.style,
        'transform',
        -position * 500,
        -500 - position * 500,
        500,
        0,
        ease,
        (v) => `translateX(${v}px)`
      )
    )
    timeline.add(
      new Animation(
        next.style,
        'transform',
        500 - nextPosition * 500,
        -nextPosition * 500,
        500,
        0,
        ease,
        (v) => `translateX(${v}px)`
      )
    )
    position = nextPosition
  }
  handler = setInterval(nextPicture, 3000)
}
```

加上手势:

```
export class Recognizer {
  start(point, context) {
    context.startX = point.clientX
    context.startY = point.clientY

    this.dispatcher.dispatch('start', {
      clientX: point.clientX,
      clientY: point.clientY,
    })
    ...
  }
  end(point, context) {
    ...
    this.dispatcher.dispatch('end', {
      startX: context.startX,
      startY: context.startY,
      clientX: point.clientX,
      clientY: point.clientY,
      isVertical: context.isVertical,
      isFlick: context.isFlick,
      velocity: v,
    })
  }
}
```

```
render() {
  ...
  enableGesture(this.root)
  let timeline = new Timeline()
  timeline.start()

  let children = this.root.children

  let handler = null
  let position = 0
  let t = 0
  let ax = 0

  this.root.addEventListener('start', (event) => {
    timeline.pause()
    clearInterval(handler)
    if (Date.now() - t < 500) {
      let progress = (Date.now() - t) / 500
      ax = ease(progress) * 500 - 500
    } else {
      ax = 0
    }
  })

  this.root.addEventListener('pan', (event) => {
    let x = event.clientX - event.startX - ax

    let current = position - (x - (x % 500)) / 500

    for (let offset of [-2, -1, 0, 1, 2]) {
      let pos = current + offset
      // pos = (pos % children.length + children.length) % children.length
      pos = pos % children.length
      pos = pos < 0 ? pos + children.length : pos
      children[pos].style.transform = `translateX(${
        -pos * 500 + offset * 500 + (x % 500)
    }px)`
    }
  })

  this.root.addEventListener('end', (event) => {
    timeline.reset()
    timeline.start()
    handler = setInterval(nextPicture, 3000)
    let x = event.clientX - event.startX - ax

    let current = position - (x - (x % 500)) / 500

    let direction = Math.round((x % 500) / 500)

    if (event.isFlick) {
      if (event.velocity < 0) {
        direction = Math.ceil((x % 500) / 500)
      } else {
        direction = Math.floor((x % 500) / 500)
      }
    }

    for (let offset of [-1, 0, 1]) {
      let pos = current + offset
      pos = pos % children.length
      pos = pos < 0 ? pos + children.length : pos
      timeline.add(
        new Animation(
          children[pos].style,
          'transform',
          -pos * 500 + offset * 500 + (x % 500),
          -pos * 500 + offset * 500 + direction * 500,
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        )
      )
    }
    position = position - (x - (x % 500)) / 500 - direction
    position = position % children.length
    position = position < 0 ? position + children.length : position
  })
  let nextPicture = () => {
    t = Date.now()
    ...
  }
}
```

## 为组件添加更多属性

```

export const STATE = Symbol('state')
export const ATTRIBUTE = Symbol('attribute')

export class Component {
  constructor() {
    this[ATTRIBUTE] = Object.create(null)
    this[STATE] = Object.create(null)
  }
  setAttribute(name, value) {
    this[ATTRIBUTE][name] = value
  }
  appendChild(child) {
    child.mountTo(this.root)
  }
  mountTo(parent) {
    if (!this.root) {
      this.render()
    }
    parent.appendChild(this.root)
  }
  triggerEvent(type, args) {
    this[ATTRIBUTE]['on' + type.replace(/^[\s\S]/, (s) => s.toUpperCase())](
      new CustomEvent(type, { detail: args })
    )
  }
}
```

这样在使用 Carousel 的时候可以绑定事件，传递参数也很方便

```
let a = (
  <Carousel
    src={d}
    onChange={(event) => console.log(event.detail.position)}
    onClick={(event) => (window.location.href = event.detail.data.url)}
  />
)
```

```
this.root.addEventListener('tap', (event) => {
  this.triggerEvent('click', {
    data: this[ATTRIBUTE].src[this[STATE].position],
    position: this[STATE].position,
  })
})

let nextPicture = () => {
  ...
  this.triggerEvent('change', {
    position: this[STATE].position,
  })
}
```

## 加入 Children 机制

```
export class Button extends Component {
  constructor() {
    super()
  }
  render() {
    this.childContainer = <span />
    this.root = (<div>{this.childContainer}</div>).render()
    return this.root
  }
  appendChild(child) {
    if (!this.childContainer) {
      this.render()
    }
    this.childContainer.appendChild(child)
  }
}

// 使用
let a = <Button>content</Button>
a.mountTo(document.body)
```

```
export class List extends Component {
  constructor() {
    super()
  }
  render() {
    this.children = this[ATTRIBUTE].data.map(this.template)
    this.root = (<div>{this.children}</div>).render()
    return this.root
  }
  appendChild(child) {
    this.template = child
    this.render()
  }
}
// 使用
let a = ( 、
  <List data={d}>
    {(record) => (
      <div>
        <img src={record.img} />
        <a href={record.url}>{record.title}</a>
      </div>
    )}
  </List>
)
a.mountTo(document.body)
export function createElement(type, attributes, ...children) {
  ...
  let processChildren = (children) => {
    for (let child of children) {
      if (Array.isArray(child)) {
        processChildren(child)
        continue
      }
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      element.appendChild(child)
    }
  }
  processChildren(children)
  return element
}
```
