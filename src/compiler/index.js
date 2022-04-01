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

  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  const stack = []
  let currentParent // 指向的是栈中的最后一个
  let root

  //最终要转换成一颗抽象语法树

  function createASTElement (tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      attrs,
      parent: null,
      children: []
    }
  }

  // 你用栈结构 去构造一棵树
  function start (tag, attrs) {
    let node = createASTElement(tag, attrs) //创造一个ast节点
    if (!root) { // 看看是否为空数
      root = node  // 将当前节点当成树的根节点
    }

    if (currentParent) {
      node.parent = currentParent
      currentParent.children.push(node) // 还需要父亲记住自己
    }
    stack.push(node)
    currentParent = node // currentParent为栈中最后一个
    console.log(tag, attrs, '开始');
  }

  function chars (text) { // 文本直接放到当前指向的节点
    text = text.replace(/\s/g, '')
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
    console.log(text, '文本');
  }

  function end (tag) {
    stack.pop() //弹出最后一个
    currentParent = stack.at(-1)
    console.log(tag, '结束');

  }


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
      // console.log(match);
      //去除>结束标签
      if (end) {
        advance(end[0].length)
      }
      // console.log(html);
      return match
    }

    return false //不是开始标签
  }


  while (html) {
    // 如果textEnd为0 这是开始或者结束标签
    // 如果>0 说明是文本的结束位置
    let textEnd = html.indexOf('<') // 如果indexOf中的索引是0,说明是一个标签
    if (textEnd === 0) {
      const startTagMatch = parseStartTag() //开始标签的匹配结果
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      const endTagMatch = html.match(endTag)  //处理结束标签 </xxx>
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }

    }
    if (textEnd > 0) { //去除<之后说明有文本了
      let text = html.substring(0, textEnd)
      if (text) {
        chars(text)
        advance(text.length)
      }

    }

  }
  console.log(html);
  console.log(root);
}



export function compileToTFunction (template) {
  // 1.将template转换成ast语法树
  let ast = parseHTML(template)

  // 2.生成render函数 (render方法执行的返回的结果就是虚拟dom)

  console.log(template);
}