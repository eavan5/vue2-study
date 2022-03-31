(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  // 对模板进行编译处理

  function parseHTML(html) {
    // vue2中 html最开始肯定是一个<
    function advance(n) {
      // console.log(html);
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

        var attrs, end;

        while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
          advance(attrs[0].length);
          match.attrs.push({
            name: attrs[1],
            value: attrs[3] || attrs[4] || attrs[5]
          });
        }

        console.log(match); //去除>结束标签

        if (end) {
          advance(end[0].length);
        }

        console.log(html);
        return match;
      }

      return false; //不是开始标签
    }

    while (html) {
      // 如果textEnd为0 这是开始或者结束标签
      // 如果>0 说明是文本的结束位置
      var textEnd = html.indexOf('<'); // 如果indexOf中的索引是0,说明是一个标签

      if (textEnd === 0) {
        parseStartTag(); //开始标签的匹配结果

        break;
      }
    }
  }

  function compileToTFunction(template) {
    // 1.将template转换成ast语法树
    parseHTML(template); // 2.生成render函数 (render方法执行的返回的结果就是虚拟dom)

    console.log(template);
  }

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

  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 重写了数组的方法
      var result = oldArrayProto.call.apply(oldArrayProto, [this].concat(args)); //内部调用原来的方法
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
      }

      console.log('新增的内容');
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

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
  }();

  function defineReactive(data, key, value) {
    //这个函数是一个闭包
    observe(value); //递归检测 直到是一个简单数据类型为止

    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue); //赋值的时候再去做一个递归

        value = newValue;
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
    var opts = vm.$options; // if (opts.props) {
    //   initProps()
    // }

    if (opts.data) {
      initData(vm);
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
    observe(data); // 将vm._data 用vm来代理就可以了

    for (var key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        proxy(vm, '_data', key);
      }
    }
  }

  function initMixin(Vue) {
    // 给vue真假init方法
    Vue.prototype._init = function (options) {
      //用于初始化操作
      var vm = this; // v,.$options  就是获取用户的配置

      vm.$options = options; //初始化状态

      initState(vm);

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
        } // script标签如果引用的是vue.global.js 这个编译过程是在浏览器端的
        // runtime是不包括把模板编译的,这个编译打包的过程是放在loader去转译.vue文件的,用runtime的时候不能使用template标签

      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
