# jqGrid 固定列1像素偏移修复方案

## 问题描述

在使用jqGrid实现固定列功能时，经常会遇到1像素偏移的问题，主要原因包括：

1. **边框宽度计算不准确** - CSS中的border会影响元素的实际宽度
2. **列宽度动态变化** - 用户调整列宽或窗口大小时，固定的`left`值无法自动更新
3. **浏览器渲染差异** - 不同浏览器对像素的处理可能存在细微差异

## 解决方案

本方案提供了两种修复方式：

### 方案1：纯CSS解决方案（静态）
使用`jqgrid-fixed-columns.css`文件，适用于列宽度固定的场景。

### 方案2：JavaScript动态计算（推荐）
使用`jqgrid-fixed-columns.js`文件，动态计算列宽度，完全解决偏移问题。

## 文件说明

| 文件名 | 描述 |
|--------|------|
| `jqgrid-fixed-columns.css` | CSS样式文件，包含固定列的基础样式 |
| `jqgrid-fixed-columns.js` | JavaScript工具，动态计算列位置 |
| `jqgrid-sticky-example.html` | 完整的使用示例 |

## 使用方法

### 快速开始

1. **引入文件**
```html
<!-- 引入样式文件 -->
<link rel="stylesheet" href="jqgrid-fixed-columns.css">

<!-- 引入JavaScript文件 -->
<script src="jqgrid-fixed-columns.js"></script>
```

2. **初始化jqGrid并应用固定列**
```javascript
$("#myGrid").jqGrid({
    // ... 其他jqGrid配置
    loadComplete: function() {
        // 固定前4列
        $(this).fixStickyColumns(4);
    }
});
```

### 详细配置

#### 方法1：jQuery插件方式
```javascript
// 固定前4列
$('#myGrid').fixStickyColumns(4);

// 固定前2列
$('#myGrid').fixStickyColumns(2);
```

#### 方法2：直接调用函数
```javascript
// 固定指定表格的前4列
jqGridStickyColumns.fix('myGrid', 4);
```

#### 方法3：在jqGrid事件中使用
```javascript
$("#myGrid").jqGrid({
    datatype: "local",
    colModel: [
        // ... 列定义
    ],
    loadComplete: function() {
        // 表格加载完成后应用固定列
        $(this).fixStickyColumns(4);
    },
    resizeStop: function() {
        // 列宽调整完成后重新计算
        $(this).fixStickyColumns(4);
    }
});
```

## 技术原理

### 核心思路
1. **动态计算**：使用JavaScript实时计算每列的实际宽度
2. **精确定位**：基于计算结果动态设置`left`位置
3. **事件监听**：监听窗口大小变化和列宽调整事件
4. **样式注入**：动态生成CSS规则并注入到页面

### 关键特性
- ✅ 自动计算列宽度，无需手动指定
- ✅ 支持列宽度调整
- ✅ 支持窗口大小变化
- ✅ 支持任意数量的固定列
- ✅ 包含悬停和选中状态效果
- ✅ 兼容jqGrid的所有功能

## 常见问题

### Q: 为什么要使用box-shadow而不是border？
A: `box-shadow`不会影响元素的布局尺寸，避免了边框宽度导致的计算误差。

### Q: 如何清理固定列效果？
A: 使用清理函数：
```javascript
jqGridStickyColumns.cleanup('myGrid');
```

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器，包括：
- Chrome 23+
- Firefox 16+
- Safari 7+
- Edge 12+
- IE 11+

### Q: 如何自定义固定列的样式？
A: 可以通过CSS覆盖默认样式：
```css
#myGrid .ui-jqgrid-btable tbody tr td:first-child {
    background: #f0f0f0 !important;
    border-right: 2px solid #007bff !important;
}
```

## 性能优化

1. **防抖处理**：窗口大小变化事件使用防抖，避免频繁计算
2. **样式缓存**：避免重复创建相同的样式规则
3. **选择器优化**：使用ID选择器提高查找效率

## 兼容性说明

- 兼容jqGrid 4.x和5.x版本
- 兼容free-jqGrid
- 需要jQuery 1.7+
- 支持响应式设计

## 示例预览

运行`jqgrid-sticky-example.html`可以看到完整的演示效果，包括：
- 固定列的基本功能
- 列宽调整
- 数据添加/删除
- 悬停效果
- 选中状态

## 贡献

如果发现问题或有改进建议，欢迎提交Issue或Pull Request。

## 许可证

MIT License