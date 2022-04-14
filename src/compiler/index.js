import { parseHTML } from "./parse";

function genProps (attrs) {
  let str = ''
  for (let o = 0; o < attrs.length; o++) {
    const attr = attrs[o];
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach(item => {
        const [key, value] = item.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function genChildren (children) {
  if (children) return `${children.map(c => gen(c)).join(',')}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // 匹配{{xxxx}}
function gen (node) {
  if (node.type == 1) {
    return genCode(node);
  } else {
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }
    let lastIndex = defaultTagRE.lastIndex = 0
    let tokens = [];
    let match, index;
    // console.log(text);
    while (match = defaultTagRE.exec(text)) {
      index = match.index;
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      // console.log(index, lastIndex);
      tokens.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join('+')})`;
  }
}

function genCode (ast) {
  let children = genChildren(ast.children)
  let code = `_c('${ast.tag}',${ast.attrs.length ? `${genProps(ast.attrs)}` : 'undefined'
    }${children ? `,${children}` : ''
    })`;
  return code;
}

export function compileToTFunction (template) {
  // 1.将template转换成ast语法树
  let ast = parseHTML(template)
  // console.log('template:', template);

  // console.log('ast:', ast);
  // 2.生成render函数 (render方法执行的返回的结果就是虚拟dom)
  let code = genCode(ast) //生成render函数的字符串
  code = `with(this){return ${code}}`
  let render = new Function(code)
  // console.log('render函数:', render);
  // console.log(render.toString());
  // console.log(template);
  return render
}