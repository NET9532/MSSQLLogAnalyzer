# jqGrid 固定列1像素偏移快速修复指南

## 🚀 快速实施步骤

### 步骤1：替换CSS样式
在你的页面样式中，**完全替换**原有的固定列样式：

```css
/* ===== 删除原有的样式，替换为以下内容 ===== */

/* 重置所有相关元素的box-sizing */
.ui-jqgrid .ui-jqgrid-btable tbody tr td,
.ui-jqgrid .ui-jqgrid-htable thead tr th {
    box-sizing: border-box;
}

/* 第一列固定 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:first-child,
.ui-jqgrid .ui-jqgrid-htable thead tr th:first-child {
    position: sticky !important;
    left: 0 !important;
    background: #fff !important;
    z-index: 10 !important;
    box-shadow: 1px 0 0 0 #ddd !important;
    border-right: none !important;
    border-left: 1px solid #ddd !important;
}

/* 第二列固定 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(2),
.ui-jqgrid .ui-jqgrid-htable thead tr th:nth-child(2) {
    position: sticky !important;
    left: var(--col1-width, 30px) !important;
    background: #fff !important;
    z-index: 9 !important;
    box-shadow: 1px 0 0 0 #ddd !important;
    border-right: none !important;
}

/* 第三列固定 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(3),
.ui-jqgrid .ui-jqgrid-htable thead tr th:nth-child(3) {
    position: sticky !important;
    left: var(--col1-2-width, 60px) !important;
    background: #fff !important;
    z-index: 8 !important;
    box-shadow: 1px 0 0 0 #ddd !important;
    border-right: none !important;
}

/* 第四列固定 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(4),
.ui-jqgrid .ui-jqgrid-htable thead tr th:nth-child(4) {
    position: sticky !important;
    left: var(--col1-3-width, 90px) !important;
    background: #fff !important;
    z-index: 7 !important;
    box-shadow: 1px 0 0 0 #ddd !important;
    border-right: none !important;
}

/* 修复表格边框问题 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td {
    border-left: none !important;
}

.ui-jqgrid .ui-jqgrid-htable thead tr th {
    border-left: none !important;
}

/* 确保表格可以水平滚动 */
.ui-jqgrid .ui-jqgrid-bdiv {
    overflow-x: auto !important;
}
```

### 步骤2：添加JavaScript文件
将 `sample-grid-sticky-fix.js` 文件放到你的脚本文件夹中，然后在页面中引用：

```html
<script src="~/Content/scripts/sample-grid-sticky-fix.js"></script>
```

### 步骤3：在页面初始化时调用
在你的 `$(function() { ... })` 代码块中，表格初始化完成后添加：

```javascript
// 在 initAnalyzeGrid() 之后添加
setTimeout(function() {
    if (window.SampleGridStickyFix) {
        SampleGridStickyFix.init({
            gridId: 'gridTable',  // 你的表格ID
            fixedColumns: 4,      // 要固定的列数
            debug: false          // 生产环境设为false
        });
    }
}, 500);
```

### 步骤4：在刷新时重新应用
修改你的 `refreshGrid` 函数：

```javascript
function refreshGrid() {
    layerLoading();
    $('div[role="tooltip"]').remove();
    top.reloadBaseData && top.reloadBaseData(function () {
        $gTable.trigger("reloadGrid");
        // 添加这段代码
        setTimeout(function() {
            if (window.SampleGridStickyFix) {
                SampleGridStickyFix.applyFix();
            }
        }, 200);
    });
};
```

## ✅ 关键修复点

1. **使用 `box-shadow` 替代 `border`** - 避免边框影响布局计算
2. **动态计算列宽度** - 使用JavaScript实时获取列的实际宽度
3. **CSS变量** - 动态设置每列的准确位置
4. **边框处理** - 移除内部边框，只保留必要的边框
5. **事件监听** - 自动响应窗口大小变化和表格重新加载

## 🔧 核心原理

### 问题根源
- 原CSS使用固定像素值（30px, 60px）无法适应动态列宽
- 边框宽度被重复计算导致偏移
- 不同浏览器的渲染差异

### 解决方案
- JavaScript动态计算实际列宽度
- 使用 `outerWidth(false)` 获取精确尺寸
- CSS变量实现动态位置设置
- `box-shadow` 避免布局影响

## 🎯 预期效果

✅ 固定列完美对齐，无1像素偏移  
✅ 支持列宽度调整  
✅ 支持窗口大小变化  
✅ 支持表格刷新  
✅ 保持原有交互效果  

## 🐛 故障排除

如果仍有问题：

1. **检查CSS优先级** - 确保新样式中的 `!important` 生效
2. **检查表格ID** - 确认 `gridId` 设置正确
3. **检查时机** - 确保在表格完全渲染后才调用修复函数
4. **开启调试** - 设置 `debug: true` 查看控制台输出

## 📞 技术支持

如果按照以上步骤操作后仍有问题，请检查：
- 浏览器开发者工具中是否有JavaScript错误
- CSS样式是否被正确应用
- 表格HTML结构是否符合预期