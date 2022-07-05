import { createElm, patch } from '../vdom/patch'
import { compileToTFunction } from './compiler'
import { initGlobalAPI } from './globalAPI'
import { initMixin } from './init'
import { initLifecycle } from './lifecycle'
import { initStateMixin } from './state'



function Vue (options) {
  this._init(options)
}



initMixin(Vue) // 扩展了init方法
initLifecycle(Vue) //vm._update vm.render
initGlobalAPI(Vue) // 全局api的实现
initStateMixin(Vue) //实现了nextTick he $watch

// 为了方便观察前后的虚拟节点  测试用的
let render1 = compileToTFunction(`<ul style='color:yellow'>
<li key='a'>a</li>
<li key='b'>b</li>
<li key='c'>c</li>
</ul>`)
let vm1 = new Vue({ data: { name: 'wumao' } })
let preVnode = render1.call(vm1)
console.log(preVnode);

let el = createElm(preVnode)
document.body.appendChild(el)


// 如果用户自己操作dom  可能会有些问题 比如性能浪费
let render2 = compileToTFunction(`<ul style='background:red'>
<li key='c'>c</li>
<li key='a'>a</li>
<li key='b'>b</li>
<li key='d'>d</li>
</ul>`)
let vm2 = new Vue({ data: { name: '9999' } })
let nextVnode = render2.call(vm2)
console.log(nextVnode)
let newEl = createElm(nextVnode)


// 所以我们需要比较两个的区别之后并且进行替换
//  diff算法是一个平级比较的过程  父亲和父亲比对 儿子和儿子去比对 (因为很少有跨层级比对)
setTimeout(() => {
  patch(preVnode, nextVnode)
}, 2000);



export default Vue