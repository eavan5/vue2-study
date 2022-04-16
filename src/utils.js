const strats = {}
const LIFECYCLE = [
  'beforeCreate',
  'created'
]
LIFECYCLE.forEach(hook => {
  strats[hook] = function (p, c) {
    // {}  {created:function(){}}  = >   {created:[fn]}
    // {created:[fn]} {created:function(){}}  =>  {created:[fn,fn]}
    if (c) {  // 如果儿子有 父亲有 则合并起来, 否则返回一个数组里面只有儿子
      if (p) {
        return p.concat(c)
      } else {
        return [c]
      }
    } else {
      return p
    }
  }
})


export function mergeOptions (parent, child) {
  console.log(parent);
  const options = {}
  for (const key in parent) {
    mergeFiled(key)
  }
  for (const key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeFiled(key)
    }
  }
  function mergeFiled (key) {
    // 用策略模式,减少if else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      //如果不在策略中优先采用儿子的,再采用父亲
      options[key] = child[key] || parent[key]
    }
  }
  return options
}
