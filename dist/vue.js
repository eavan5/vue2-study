(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  // h() _c()
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    data || (data = {});
    var key = data.key;
    if (key) delete data.key;

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } //_v()

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } // ast一样?? ast做的是语法层面的转换  描述的是语法本身
  // 我们的虚拟dom 是描述的dom元素,可以增加一些自定义的属性

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag); // 这里将真实节点与虚拟节点对应起来,后续如果修改属性,可以通过虚拟节点修改真实节点

      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // console.log(oldProps, props);
    // 老的属性中有,新的没有 要删除老的 
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    for (var key in oldStyles) {
      // 老的样式中有 新的样式没有 则删除
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    }

    for (var _key in oldProps) {
      // 老的属性中有 新的属性没有 则删除
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      // 用老的覆盖新的
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    //写的出渲染流程
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      var elm = oldVNode; // 获取真实元素

      var parentElm = elm.parentNode; // 拿到父元素

      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    } else {
      //diff算法
      // 1. 两个节点不是同一个节点 (直接删除老的,换成新的,不用比对了)
      // 2. 两个节点是同个节点(判断节点的tag和节点的key(如果不存在就是undefined 就是相等的)) 在 比较两个节点的属性是否有差异(复用老的节点,更改差异的属性)
      // 3. 节点比较完成之后,就要比较节点的儿子
      return patchVnode(oldVNode, vnode);
    }
  }

  function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
      // 不是相同的节点
      // 用老节点的父亲 进行替换
      var _el = createElm(vnode);

      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    } // 文本的情况 文本我们期望比较一下文本的内容


    var el = vnode.el = oldVNode.el; // 复用老节点的元素

    if (!oldVNode.tag) {
      // 是文本
      if (oldVNode.text !== vnode.text) {
        oldVNode.el.textContent = vnode.text; // 用新的文本去覆盖掉老的
      }
    } // 是标签  我们需要比对标签的属性


    patchProps(el, oldVNode.data, vnode.data); // 比较儿子节点  比较的时候
    // 1. 一方有儿子  一方没有儿子
    // 2. 两方都有儿子

    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || []; // console.log(oldChildren, newChildren);

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 完整的diff算法  需要比较两个人的儿子
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      // 没有老的,有新的
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      // 新的没有 老的有 要删除
      unMountChildren(el);
    }
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function unMountChildren(el) {
    el.innerText = '';
    var child = el.lastElementChild;

    while (child) {
      el.removeChild(child);
      child = el.lastElementChild;
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    // 我们操作列表  经常会有push shift pop unshift  reverse sort  所以我们对这类情况进行优化
    // vue2中采用双指针的方式,比较两个节点
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren);
    console.log(map);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 双方有一方头指针大于尾指针 则停止循环
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode); // 如果是相同节点,则递归比较子节点

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex]; // 比较开头节点
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode); // 如果是相同节点,则递归比较子节点

        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex]; // 比较结尾节点
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // 交叉比对  abcd => dcba   头比尾
        patchVnode(oldEndVnode, newStartVnode); // insertBefore 具备移动性  会将原来的元素移动走

        el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老的尾巴移到老的前面去

        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // 交叉比对  abcd => bcda  尾比头
        patchVnode(oldStartVnode, newEndVnode); // insertBefore 具备移动性  会将原来的元素移动走

        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = oldChildren[--newEndIndex];
      } else {
        // 乱序比对
        // 根据老的列表做一个映射关系,用新的去找,找到则移动,找不到则添加,最后多余的就删除
        var moveIndex = map[newStartVnode.key]; // 如果拿到就说明是我要移动的索引

        if (moveIndex !== undefined) {
          var moveVnode = oldChildren[moveIndex]; // 找到对应的虚拟节点 复用

          el.insertBefore(moveVnode.el, oldStartVnode.el);
          oldChildren[moveIndex] = undefined; // 表示这个节点被移走了

          patchVnode(oldStartVnode, newEndVnode); // 比对属性和子节点
        } else {
          // 找不到 直接创建一个节点直接插入
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    } // 再给动态列表添加key的时候, 要尽量避免用索引 因为索引都是从0 开始的  所以可能会发成错误复用,增加性能损耗


    if (newStartIndex <= newEndIndex) {
      // 新入的多余的插进去
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]); // 这里面可能是向后追加 也可能是向前追加

        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // 获取下一个元素

        el.insertBefore(childEl, anchor); // anchor 为null的时候则认为是appendChild
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      // 老的多余的删除掉
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    } // 我们为了比较两个儿子的时候,提升性能,会有一些优化手段


    console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
  } // 如果批量向页面中修改出入内容 浏览器会自动优化  不用createDocumentFragment

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  //vue3采用的不是正则
  // 对模板进行编译处理

  function parseHTML(html) {
    // vue2中 html最开始肯定是一个<
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent; // 指向的是栈中的最后一个

    var root;

    while (html) {
      // 如果textEnd为0 这是开始或者结束标签
      // 如果>0 说明是文本的结束位置
      var textEnd = html.indexOf('<'); // 如果indexOf中的索引是0,说明是一个标签

      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); //开始标签的匹配结果

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag); //处理结束标签 </xxx>

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        //去除<之后说明有文本了
        var text = html.substring(0, textEnd);

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    } //最终要转换成一颗抽象语法树


    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        attrs: attrs,
        parent: null,
        children: []
      };
    } // 你用栈结构 去构造一棵树


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); //创造一个ast节点

      if (!root) {
        // 看看是否为空数
        root = node; // 将当前节点当成树的根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node); // 还需要父亲记住自己
      }

      stack.push(node);
      currentParent = node; // currentParent为栈中最后一个

      console.log(tag, attrs, '开始');
    }

    function chars(text) {
      // 文本直接放到当前指向的节点
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
      console.log(text, '文本');
    }

    function end(tag) {
      stack.pop(); //弹出最后一个

      currentParent = stack.at(-1);
      console.log(tag, '结束');
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen); // console.log(start);

      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        advance(start[0].length); //如果不是开始标签的结束/>并且标签上还有属性 就一直匹配下去

        var attrs, _end;

        while (!(_end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
          advance(attrs[0].length);
          match.attrs.push({
            name: attrs[1],
            value: attrs[3] || attrs[4] || attrs[5]
          });
        } // console.log(match);
        //去除>结束标签


        if (_end) {
          advance(_end[0].length);
        } // console.log(html);


        return match;
      }

      return false; //不是开始标签
    }

    return root;
  }

  function genProps(attrs) {
    var str = '';

    for (var o = 0; o < attrs.length; o++) {
      var attr = attrs[o];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function genChildren(children) {
    if (children) return "".concat(children.map(function (c) {
      return gen(c);
    }).join(','));
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{xxxx}}

  function gen(node) {
    if (node.type == 1) {
      return genCode(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      }

      var lastIndex = defaultTagRE.lastIndex = 0;
      var tokens = [];
      var match, index; // console.log(text);

      while (match = defaultTagRE.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        } // console.log(index, lastIndex);


        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }

      return "_v(".concat(tokens.join('+'), ")");
    }
  }

  function genCode(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length ? "".concat(genProps(ast.attrs)) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToTFunction(template) {
    // 1.将template转换成ast语法树
    var ast = parseHTML(template); // console.log('template:', template);

    console.log('ast:', ast); // 2.生成render函数 (render方法执行的返回的结果就是虚拟dom)

    var code = genCode(ast); //生成render函数的字符串 "_c('li',{style:{"color":"yellow"}},_v(_s(name)),_c('div',undefined,_v("11"),_c('div',undefined)))"

    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); // console.log('render函数:', render);
    // console.log(render.toString());
    // console.log(template);

    return render;
  }

  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      // {}  {created:function(){}}  = >   {created:[fn]}
      // {created:[fn]} {created:function(){}}  =>  {created:[fn,fn]}
      if (c) {
        // 如果儿子有 父亲有 则合并起来, 否则返回一个数组里面只有儿子
        if (p) {
          return p.concat(c);
        } else {
          return [c];
        }
      } else {
        return p;
      }
    };
  });
  function mergeOptions(parent, child) {
    // console.log(parent);
    var options = {};

    for (var key in parent) {
      mergeFiled(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeFiled(_key);
      }
    }

    function mergeFiled(key) {
      // 用策略模式,减少if else
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        //如果不在策略中优先采用儿子的,再采用父亲
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    // 静态方法
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // 我们期望将用户逇选项和全局的options进行合并
      this.options = mergeOptions(this.options, mixin);
      return this; // 期望可以链式调用
    };
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; // 属性的dep需要去收集watcher

      this.subs = []; // 这里面存放着当前属性对应的watcher
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 这里面我们不希望放置重复的watcher
        // 并且我们要watcher记录dep
        // this.subs.push(Dep.target) // 这么写当重复取一个值的时候,会收集重复的watcher
        Dep.target.addDep(this); // 让watcher去记住dep
        // debugger
        // dep和watcher是一个多对多的关系(一个属性在多个组件中可以dep=>多个watcher)
        // 一个组件中由多个属性组成 (一个watcher对应多个dep)
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        }); // 告诉watcher更新了
      }
    }]);

    return Dep;
  }();

  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    // 渲染完入栈
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    // 渲染完出栈
    stack.pop();
    Dep.target = stack.at(-1);
  }

  var id = 0; //不同的组件有不同的watcher
  // 1) 但我们创建渲染watcher的时候,我们会把当前watcher的实例放在Dep.target上面
  // 2) 调用_render() 会取值走到get上
  // 每个属性有一个dep(属性就是被观察者), watcher就是观察者(属性变化了就通知观察者来更新) ==> 观察者模式

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.id = id++;
      this.renderWatcher = options; // 标识是一个渲染watcher

      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          return vm[exprOrFn];
        };
      } else {
        this.getter = exprOrFn; // getter 意味着调用这个函数会发生取值操作
      }

      this.deps = []; // (组件卸载的时候,清除所有的响应式数据,和用到一些计算属性会用到)

      this.depsId = new Set(); // 用来去重dep

      this.lazy = options.lazy;
      this.dirty = this.lazy; // 缓存值

      this.cb = cb; // watch api用的

      this.user = options.user; // 用户标识是不是用户自己的watcher

      this.value = this.lazy ? undefined : this.get();
    }

    _createClass(Watcher, [{
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); // 获取到用户函数的返回值,并且还要标识为脏值

        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        // Dep.target = this 
        pushTarget(this); // 静态属性只有一份

        var value = this.getter.call(this.vm); // 会从vm上去取值,这时候让正常的Observer去收集计算属性watcher,如果是渲染watcher这个就是_update(vm,_render())
        // Dep.target = null 

        popTarget(); // 渲染完毕之后清空(避免在js中调用值被收集watcher)

        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应着多个属性 重复的属性也不用记录
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住dep 并且去重了 此时也让dep记住watcher
        }
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        console.log('deps:', this.deps);

        while (i--) {
          // dep去收集watcher
          this.deps[i].depend(); // 让计算属性watcher也收集渲染watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          // 如果计算属性变化了,则将它重新标为脏值
          this.dirty = true;
        } else {
          // console.log('update');
          // this.get() // 重新渲染
          queueWatcher(this); // 把当前的watcher暂存起来
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get(); // 渲染的时候用最新的vm来渲染

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var pending = false; // 防抖

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    pending = false;
    queue = [];
    has = {};
    flushQueue.forEach(function (q) {
      return q.run();
    }); // 在刷新的过程中可能还有新的watcher,重新放到queue中
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true; // 不管update执行多少次  但是最终只执行一轮刷新操作

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallBacks() {
    waiting = false;
    var cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  } // nextTick 没有直接使用某个API 而是采用优雅降级的方式(vue3直接用promise)
  // 内部先采用的是promise (IE不兼容) 然后降级到MutationObserve(H5的方法) 然后可以考虑IE专享的setImmediate  最后使用setTimeout


  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc(cb) {
      Promise.resolve().then(cb);
    };
  } else if (MutationObserver) {
    var observe$1 = new MutationObserver(cb); // 这里面传入的回调是异步执行的

    var textNode = document.createTextNode(1);
    observe$1.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(cb);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(cb);
    };
  }

  function nextTick(cb) {
    callbacks.push(cb); // 维护nextTrick的回调

    if (!waiting) {
      waiting = true;
      timerFunc(flushCallBacks); // 最后一起刷新
    }
  } // 需要给每个属性增加一个dep,目的就是去收集watcher

  function initLifecycle(Vue) {
    Vue.prototype._render = function () {
      var vm = this; // 让with的this指向vm
      // 当渲染的时候就会从实例中去取值,我们就可以将属性和视图绑定在一起

      return vm.$options.render.call(vm); //将AST语法转译后后生成的render方法
    }; //_c('div',{},...children)


    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };

    Vue.prototype._update = function (vnode) {
      // 将vnode转换成真实dom
      var vm = this;
      var el = vm.$el; // patch 既有初始化的功能 又有更新的功能

      vm.$el = patch(el, vnode);
    };
  }
  function mountComponent(vm, el) {
    // 这里的el是通过querySelector处理过的
    vm.$el = el; //1.调用render函数产生虚拟dom
    // vm._render() // vm.$options.render 生成虚拟节点
    //2.根据虚拟dom生成真实dom

    console.log('虚拟dom:', vm._render());

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, true); // true用于标识是渲染watcher
    // console.log(watchers);
    //3.插入到真实dom
  } // Vue核心流程  
  // 1) 创建了响应式数据
  // 2) 模板转换成ast语法树
  // 3) 将ast语法树转换成render函数
  // 4) 后续每次数据更新可以直接执行render函数(无需再次执行ast转换的过程)
  // render函数会产生虚拟节点(使用响应式数据)
  // 根据生成的虚拟节点创建真实的dom

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 重写了数组的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调用原来的方法
      //我们需要对新增的数据再进行劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        //如果有新增的数据 再对他进行劫持
        ob.observeArray(inserted);
      } // console.log('新增的内容');


      ob.dep.notify(); // 数组变化了 通知对应的watcher实现更新逻辑

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      this.dep = new Dep(); // 这里的dep专门为数组设计的
      // object.defineProperty只能劫持已经存在的属性,后增($set)的或者删除($delete)的不会影响
      // 这样不仅给data增加了新的法法,还给数据加了一个标识 如果有这个就说明已经被观察过了

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false //防止被循环引用

      });

      if (Array.isArray(data)) {
        //去重写数组的原型
        Object.setPrototypeOf(data, newArrayProto); // 如果数组中放的是对象 也让他去检测到

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象 对属性依次劫持
        // "重新定义"属性 所以性能很差
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }(); // 嵌套就会深层次递归 , 递归多了性能差  不存在属性监控不到,存在的属性要重写方法  所以vue3使用proxy去优化


  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function defineReactive(data, key, value) {
    //这个函数是一个闭包
    var childOb = observe(value); //递归检测 直到是一个简单数据类型为止 childOb 用来收集依赖的

    var dep = new Dep(); // 每一个属性都有一个dep用来做依赖收集

    Object.defineProperty(data, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); // 让这个属性的收集器记住这个watcher

          if (childOb) {
            childOb.dep.depend(); // 让数组和对象本身也实现依赖依赖

            if (Array.isArray(value)) {
              // 如果是数组,也让数组的dep做依赖收集
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue); //赋值的时候再去做一个递归

        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    //只对对象和数组进行劫持
    if (_typeof(data) !== 'object' || data === null) return;

    if (data.__ob__ instanceof Observer) {
      //说明这个对象被代理过了
      return data.__ob__;
    } //标记该对象是否被劫持过(要判断一个对象是否被劫持过,可以添加一个实例,用实例来判断是否被劫持过)


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // console.log(opts);
    // if (opts.props) {
    //   initProps()
    // }

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm);
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        // if (newValue === vm[target][key]) return
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    observe(data); // 将vm._data 用vm来代理就可以直接使用this.xxx访问到data里面的数据

    for (var key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        proxy(vm, '_data', key);
      }
    }
  }

  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; // 将计算属性watcher保存到vm上

    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === 'function' ? userDef : userDef.get; // 计算属性的get方法
      // 我们需要监控计算属性中get的变化 ,将属性和watcher关联起来

      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      }); // 如果直接new 就会执行fn,但是我们在计算属性中不需要他立即执行,所以lazy:true

      defineComputed(vm, key, userDef);
    }
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      // 字符串 数组 函数
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    // 字符串 函数 对象(不写了)
    if (typeof handler === 'string') {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  }

  function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    var setter = userDef.set || function () {
      return [];
    }; // 可以通过实例拿到对应的属性


    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  } // 计算属性根本不会去收集依赖,只会让自己的依赖属性去收集依赖  vue3跟vue2不一样


  function createComputedGetter(key) {
    // 我们要检测是否执行这个getter
    return function () {
      var watcher = this._computedWatchers[key]; // 获取对应属性的watcher

      if (watcher.dirty) {
        // 如果是脏值 就去执行用户传入的函数
        watcher.evaluate(); // 求值之后 dirty变成了false 下次就不执行了
        // 并且求值的时候会去执行计算属性的回调函数,此时又会出触发回调里面的data的依赖收集,它此时会把dep全部收集到计算属性watcher的deps上
      }

      if (Dep.target) {
        //计算属性watcher出栈之后,还剩下一个渲染watcher,我们应该让计算属性watcher里面的依赖dep也去收集上一层的渲染watcher
        watcher.depend();
      }

      return watcher.value; // 最后返回的是watcher上的值
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick; // 最终调用的都是这个方法

    Vue.prototype.$watch = function (exprOrFn, cb) {
      // console.log(exprOrFn, cb);
      // firstName
      // ()=>vm.firstName
      // firstName的值变化了 直接执行cb函数
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  function initMixin(Vue) {
    // 给vue真假init方法
    Vue.prototype._init = function (options) {
      //用于初始化操作
      var vm = this; // v,.$options  就是获取用户的配置
      // 我们定义的全局指令和过滤器....都会挂载到实例上

      vm.$options = mergeOptions(this.constructor.options, options); // 将用户的options合并到构造函数的options上

      callHook(vm, 'beforeCreate'); //初始化状态

      initState(vm);
      callHook(vm, 'created');

      if (options.el) {
        vm.$mount(options.el); //实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        // 先去查找有没有render,没有render再去查是否写了template,没写template,再才采取外部template
        var template;

        if (!ops.template && el) {
          //没有写模板 但是写了el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        }

        if (template) {
          // 对模板进行编译
          var render = compileToTFunction(template);
          ops.render = render;
        }

        mountComponent(vm, el); //组件的挂载
        // script标签如果引用的是vue.global.js 这个编译过程是在浏览器端的
        // runtime是不包括把模板编译的,这个编译打包的过程是放在loader去转译.vue文件的,用runtime的时候不能使用template标签
      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 扩展了init方法

  initLifecycle(Vue); //vm._update vm.render

  initGlobalAPI(Vue); // 全局api的实现

  initStateMixin(Vue); //实现了nextTick he $watch
  // 为了方便观察前后的虚拟节点  测试用的

  var render1 = compileToTFunction("<ul style='color:yellow'>\n<li key='a'>a</li>\n<li key='b'>b</li>\n<li key='c'>c</li>\n<li key='d'>d</li>\n</ul>");
  var vm1 = new Vue({
    data: {
      name: 'wumao'
    }
  });
  var preVnode = render1.call(vm1);
  console.log(preVnode);
  var el = createElm(preVnode);
  document.body.appendChild(el); // 如果用户自己操作dom  可能会有些问题 比如性能浪费

  var render2 = compileToTFunction("<ul style='background:red'>\n<li key='d'>d</li>\n<li key='c'>c</li>\n<li key='a'>a</li>\n<li key='b'>b</li>\n</ul>");
  var vm2 = new Vue({
    data: {
      name: '9999'
    }
  });
  var nextVnode = render2.call(vm2);
  console.log(nextVnode);
  createElm(nextVnode); // 所以我们需要比较两个的区别之后并且进行替换
  //  diff算法是一个平级比较的过程  父亲和父亲比对 儿子和儿子去比对 (因为很少有跨层级比对)

  setTimeout(function () {
    patch(preVnode, nextVnode);
  }, 2000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
