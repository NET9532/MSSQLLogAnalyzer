/**
 * jqGrid 固定列工具 - 解决1像素偏移问题
 * 动态计算列宽度并设置CSS变量
 */

(function($) {
    'use strict';
    
    /**
     * 修复jqGrid固定列的位置偏移问题
     * @param {string} gridId - jqGrid的ID
     * @param {number} fixedColumns - 要固定的列数，默认为4
     */
    function fixJqGridStickyColumns(gridId, fixedColumns = 4) {
        const $grid = $('#' + gridId);
        const $table = $grid.find('.ui-jqgrid-btable');
        
        if ($table.length === 0) {
            console.warn('jqGrid table not found for id:', gridId);
            return;
        }
        
        // 等待表格渲染完成
        setTimeout(function() {
            calculateAndSetColumnPositions($grid, fixedColumns);
        }, 100);
        
        // 监听窗口大小变化
        $(window).on('resize.jqgrid-sticky', function() {
            calculateAndSetColumnPositions($grid, fixedColumns);
        });
        
        // 监听jqGrid的列宽度变化事件
        $grid.on('jqGridResizeStop', function() {
            setTimeout(function() {
                calculateAndSetColumnPositions($grid, fixedColumns);
            }, 50);
        });
    }
    
    /**
     * 计算并设置列位置
     */
    function calculateAndSetColumnPositions($grid, fixedColumns) {
        const $headerTable = $grid.find('.ui-jqgrid-htable');
        const $bodyTable = $grid.find('.ui-jqgrid-btable');
        
        if ($headerTable.length === 0 || $bodyTable.length === 0) {
            return;
        }
        
        const $headerCells = $headerTable.find('thead tr:first th');
        const positions = [0]; // 第一列始终在0位置
        
        // 计算每列的累积宽度
        for (let i = 1; i < fixedColumns; i++) {
            if (i < $headerCells.length) {
                const prevWidth = $headerCells.eq(i - 1).outerWidth();
                positions[i] = positions[i - 1] + prevWidth;
            }
        }
        
        // 设置CSS变量
        const root = document.documentElement;
        root.style.setProperty('--first-col-width', positions[1] + 'px');
        root.style.setProperty('--first-two-cols-width', positions[2] + 'px');
        root.style.setProperty('--first-three-cols-width', positions[3] + 'px');
        
        // 动态设置样式
        applyDynamicStyles($grid, positions, fixedColumns);
    }
    
    /**
     * 应用动态样式
     */
    function applyDynamicStyles($grid, positions, fixedColumns) {
        const gridId = $grid.attr('id');
        let styleId = 'jqgrid-sticky-style-' + gridId;
        
        // 移除旧样式
        $('#' + styleId).remove();
        
        // 创建新样式
        let css = '';
        for (let i = 0; i < fixedColumns; i++) {
            const nthChild = i + 1;
            const leftPosition = positions[i] || 0;
            const zIndex = 10 - i;
            
            css += `
                #${gridId} .ui-jqgrid-btable tbody tr td:nth-child(${nthChild}),
                #${gridId} .ui-jqgrid-htable thead tr th:nth-child(${nthChild}) {
                    position: sticky !important;
                    left: ${leftPosition}px !important;
                    background: #fff !important;
                    z-index: ${zIndex} !important;
                    box-shadow: 1px 0 0 0 #ddd !important;
                }
            `;
        }
        
        // 添加悬停效果
        css += `
            #${gridId} .ui-jqgrid-btable tbody tr:hover td:nth-child(-n+${fixedColumns}) {
                background: #f5f5f5 !important;
            }
            #${gridId} .ui-jqgrid-btable tbody tr.ui-state-highlight td:nth-child(-n+${fixedColumns}) {
                background: #e6f3ff !important;
            }
        `;
        
        // 插入样式到页面
        $('<style id="' + styleId + '">' + css + '</style>').appendTo('head');
    }
    
    /**
     * 清理事件监听器
     */
    function cleanupStickyColumns(gridId) {
        $(window).off('resize.jqgrid-sticky');
        $('#' + gridId).off('jqGridResizeStop');
        $('#jqgrid-sticky-style-' + gridId).remove();
    }
    
    // 暴露给全局
    window.jqGridStickyColumns = {
        fix: fixJqGridStickyColumns,
        cleanup: cleanupStickyColumns
    };
    
    // 如果jQuery存在，添加到jQuery插件
    if (window.jQuery) {
        $.fn.fixStickyColumns = function(fixedColumns) {
            return this.each(function() {
                const gridId = $(this).attr('id');
                if (gridId) {
                    fixJqGridStickyColumns(gridId, fixedColumns);
                }
            });
        };
    }
    
})(window.jQuery || window.$);

/**
 * 使用示例:
 * 
 * 方法1: 直接调用
 * jqGridStickyColumns.fix('myGridId', 4);
 * 
 * 方法2: jQuery插件方式
 * $('#myGridId').fixStickyColumns(4);
 * 
 * 方法3: 在jqGrid初始化完成后调用
 * $("#myGrid").jqGrid({
 *     // ... jqGrid配置
 *     loadComplete: function() {
 *         $(this).fixStickyColumns(4);
 *     }
 * });
 */