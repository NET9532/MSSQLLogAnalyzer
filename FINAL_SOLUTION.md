# 🎯 最终解决方案 - 消除晃动

## 问题分析

你的晃动问题主要由以下原因造成：
1. JavaScript动态计算位置时的延迟
2. CSS变量更新的时机问题
3. 浏览器重排重绘导致的视觉跳动
4. 第一列隐藏但CSS选择器没有正确适配

## 🔧 简单有效的解决方案

**直接替换你页面中的固定列CSS为以下代码：**

```css
/* ===== 最终稳定的固定列样式 - 第一列隐藏版本 ===== */

/* 基础设置 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td,
.ui-jqgrid .ui-jqgrid-htable thead tr th {
    box-sizing: border-box !important;
}

/* 隐藏第一列 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:first-child,
.ui-jqgrid .ui-jqgrid-htable thead tr th:first-child {
    display: none !important;
}

/* 第二列固定（显示的第一列） */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(2),
.ui-jqgrid .ui-jqgrid-htable thead tr th:nth-child(2) {
    position: sticky !important;
    left: 0px !important;
    background: #fff !important;
    z-index: 10 !important;
    border-right: 1px solid #ddd !important;
    border-left: 1px solid #ddd !important;
    /* 防晃动关键设置 */
    will-change: transform !important;
    transform: translateZ(0) !important;
}

/* 第三列固定（显示的第二列） */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(3),
.ui-jqgrid .ui-jqgrid-htable thead tr th:nth-child(3) {
    position: sticky !important;
    left: 30px !important; /* 根据实际第二列宽度调整 */
    background: #fff !important;
    z-index: 9 !important;
    border-right: 1px solid #ddd !important;
    /* 防晃动关键设置 */
    will-change: transform !important;
    transform: translateZ(0) !important;
}

/* 第四列固定（显示的第三列） */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(4),
.ui-jqgrid .ui-jqgrid-htable thead tr th:nth-child(4) {
    position: sticky !important;
    left: 90px !important; /* 根据前两列总宽度调整 */
    background: #fff !important;
    z-index: 8 !important;
    border-right: 1px solid #ddd !important;
    /* 防晃动关键设置 */
    will-change: transform !important;
    transform: translateZ(0) !important;
}

/* 第五列固定（显示的第四列） */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(5),
.ui-jqgrid .ui-jqgrid-htable thead tr th:nth-child(5) {
    position: sticky !important;
    left: 150px !important; /* 根据前三列总宽度调整 */
    background: #fff !important;
    z-index: 7 !important;
    border-right: 1px solid #ddd !important;
    /* 防晃动关键设置 */
    will-change: transform !important;
    transform: translateZ(0) !important;
}

/* 悬停效果 */
.ui-jqgrid .ui-jqgrid-btable tbody tr:hover td:nth-child(n+2):nth-child(-n+5) {
    background: #f5f5f5 !important;
}

/* 选中行效果 */
.ui-jqgrid .ui-jqgrid-btable tbody tr.ui-state-highlight td:nth-child(n+2):nth-child(-n+5) {
    background: #e6f3ff !important;
}

/* 滚动容器 */
.ui-jqgrid .ui-jqgrid-bdiv {
    overflow-x: auto !important;
}

/* 移除多余边框 */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(n+6) {
    border-left: none !important;
}
```

## 🎯 关键改进点

1. **移除JavaScript动态计算** - 使用固定像素值
2. **添加硬件加速** - `will-change: transform` 和 `translateZ(0)`
3. **正确的选择器** - 适配第一列隐藏的情况
4. **简化边框处理** - 避免box-shadow计算开销

## 📐 如何调整列宽

根据你的实际列宽调整这些值：

```css
/* 假设你的列宽分别是：30px, 60px, 60px, 80px */
.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(3) {
    left: 30px !important; /* 第二列宽度 */
}

.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(4) {
    left: 90px !important; /* 30 + 60 */
}

.ui-jqgrid .ui-jqgrid-btable tbody tr td:nth-child(5) {
    left: 150px !important; /* 30 + 60 + 60 */
}
```

## ✅ 使用步骤

1. **删除所有JavaScript文件引用**（如果已添加）
2. **替换原有的固定列CSS**为上面的代码
3. **根据实际列宽调整left值**
4. **测试滚动效果**

这个方案完全避免了JavaScript计算导致的晃动问题，提供最稳定的固定列效果。