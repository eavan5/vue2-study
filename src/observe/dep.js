let id = 0

class Dep {
  constructor() {
    this.id = id++ // 属性的dep需要去收集watcher
    this.subs = [] // 这里面存放着当前属性对应的watcher
  }
  depend () {
    // 这里面我们不希望放置重复的watcher
    // 并且我们要watcher记录dep
    // this.subs.push(Dep.target) // 这么写当重复取一个值的时候,会收集重复的watcher

    Dep.target.addDep(this) // 让watcher去记住dep
    // debugger
    // dep和watcher是一个多对多的关系(一个属性在多个组件中可以dep=>多个watcher)
    // 一个组件中由多个属性组成 (一个watcher对应多个dep)
  }
  addSub (watcher) {
    this.subs.push(watcher)
  }
  notify () {
    this.subs.forEach(watcher => watcher.update()) // 告诉watcher更新了
  }
}

Dep.target = null

let stack = []

export function pushTarget (watcher) {  // 渲染完入栈
  stack.push(watcher)
  Dep.target = watcher
}

export function popTarget () { // 渲染完出栈
  stack.pop()
  Dep.target = stack.at(-1)
}

export default Dep