

- 善用占位符
  console.log(' %s + %s ', 1, 1, '= 2')
  // 1 + 1  = 2

- 记录操作时间
  console.time('fff');
  console.timeEnd('fff');

- 输出带样式CSS的内容
  console.log(
    '%cThis text is styled!',
    'color: red; background: yellow; font-size: 24px;'
  )


- 获取当前时间戳
  new Date().toISOString()

- 输出对象为表格
  console.table(languages);

- 条件输出
  console.assert(list.childNodes.length < 500, '节点个数大于等于500')

- 清空输出
  console.clear()

- 显示调用路径
  console.trace()