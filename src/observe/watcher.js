import Dep from "./dep"

let id = 0  //不同的组件有不同的watcher

// 1) 但我们创建渲染watcher的时候,我们会把当前watcher的实例放在Dep.target上面
// 2) 调用_render() 会取值走到get上


// 每个属性有一个dep(属性就是被观察者), watcher就是观察者(属性变化了就通知观察者来更新) ==> 观察者模式


class Watcher {
  constructor(vm, fn, options) {
    this.id = id++
    this.renderWatcher = options // 标识是一个渲染watcher
    this.getter = fn // getter 意味着调用这个函数会发生取值操作
    this.deps = [] // (组件卸载的时候,清除所有的响应式数据,和用到一些计算属性会用到)
    this.depsId = new Set() // 用来去重dep
    this.get()
  }

  get () {
    Dep.target = this // 静态属性只有一份
    this.getter() // 会从vm上去取值 这个就是_update(vm,_render())
    Dep.target = null // 渲染完毕之后清空(避免在js中调用值被收集watcher)
  }

  addDep (dep) { // 一个组件对应着多个属性 重复的属性也不用记录
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)  // watcher已经记住dep 并且去重了 此时也让dep记住watcher
    }
  }
  update () {
    console.log('update');
    this.get() // 重新渲染
  }

}

// 需要给每个属性增加一个dep,目的就是去收集watcher

// 一个视图中 有N个属性 (n个属性会对应这一个视图,也就是n个dnp对应一个watcher) 
// 一个属性还可以对应着多个视图
// 多对多的关系
export default Watcher