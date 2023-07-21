export const wait = (milliseconds: number) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

export const formatObjToStr = (obj: any, intentNum = 4) => {
  let str = ''
  if (!obj) {
    str =  `'',`
  } else if (Array.isArray(obj)) {
    if (!obj.length) {
      str += '[]'
    } else {
      for (let i = 0; i < obj.length; i++) {
        const item = obj[i];
        str += `${' '.repeat(intentNum)}${formatObjToStr(item, intentNum + 2)}\n`
      }
      str = `[\n${str}${' '.repeat(intentNum - 2)}],`
    }
  } else if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = obj[key];
      let keyStr = `${key}`
      if (!/^(?!\d)[\w$]+$/.test(key)) {
        keyStr = `'${key}'`
      }
      str += `${i === 0 ? '' : '\n'}${' '.repeat(intentNum)}${keyStr}: ${formatObjToStr(val, intentNum + 2)}`
    }
    str = `{\n${str}\n${' '.repeat(intentNum - 2)}},`
  } else if (typeof obj === 'string') {
    let quotar = '\''
    if (/\/\${/.test(obj)) {
      quotar = '`'
    }
    str += `${quotar}${obj}${quotar},`
  } else {
    str += `${obj},`
  }
  return str
}

export const objToStr = (obj: any) => {
  let str = formatObjToStr(obj)
  const len = str.length
  if (len && str[len - 1] === ',') {
    str = str.slice(0, len - 1)
  }
  return str
}
