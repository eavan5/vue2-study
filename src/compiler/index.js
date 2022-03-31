const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g


//vue3采用的不是正则
// 对模板进行编译处理
function parseHTML (html) { // vue2中 html最开始肯定是一个<
  function advance (n) {
    // console.log(html);
    html = html.substring(n)
  }
  function parseStartTag () {
    const start = html.match(startTagOpen)
    // console.log(start);
    if (start) {
      const match = {
        tagName: start[1], //标签名
        attrs: []
      }
      advance(start[0].length)


      //如果不是开始标签的结束/>并且标签上还有属性 就一直匹配下去
      let attrs, end
      while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
        advance(attrs[0].length)
        match.attrs.push({
          name: attrs[1],
          value: attrs[3] || attrs[4] || attrs[5]
        })
      }
      console.log(match);
      //去除>结束标签
      if (end) {
        advance(end[0].length)
      }
      console.log(html);
      return match
    }


    return false //不是开始标签
  }


  while (html) {
    // 如果textEnd为0 这是开始或者结束标签
    // 如果>0 说明是文本的结束位置
    let textEnd = html.indexOf('<') // 如果indexOf中的索引是0,说明是一个标签
    if (textEnd === 0) {
      let startTagMatch = parseStartTag() //开始标签的匹配结果

      break
    }

  }
}



export function compileToTFunction (template) {
  // 1.将template转换成ast语法树
  let ast = parseHTML(template)

  // 2.生成render函数 (render方法执行的返回的结果就是虚拟dom)

  console.log(template);
}