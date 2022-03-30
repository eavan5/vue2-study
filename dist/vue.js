(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function initState(vm) {
    var opts = vm.$options; // if (opts.props) {
    //   initProps()
    // }

    if (opts.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    console.log(data);
  }

  function initMixin(Vue) {
    // 给vue真假init方法
    Vue.prototype._init = function (options) {
      //用于初始化操作
      var vm = this; // v,.$options  就是获取用户的配置

      vm.$options = options; //初始化状态

      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); // 扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
