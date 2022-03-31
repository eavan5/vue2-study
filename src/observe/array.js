let oldArrayProto = Array.prototype


export let newArrayProto = Object.create(oldArrayProto)


let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort'
]

methods.forEach(method => {
  newArrayProto[method] = function (...args) {  // 重写了数组的方法

    const result = oldArrayProto.call(this, ...args)  //内部调用原来的方法

    //我们需要对新增的数据再进行劫持
    let inserted
    const ob = this.__ob__
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break
      default:
        break;
    }
    if (inserted) {//如果有新增的数据 再对他进行劫持
      ob.observeArray(inserted)
    }
    console.log('新增的内容');
    return result
  }
})