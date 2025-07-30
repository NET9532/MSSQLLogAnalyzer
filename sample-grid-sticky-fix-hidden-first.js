/**
 * 样本页面 jqGrid 固定列精确修复 - 第一列隐藏版本
 * 专门解决第一列隐藏时的1像素偏移问题
 */

(function($) {
    'use strict';
    
    var SampleGridStickyFixHidden = {
        // 配置选项
        options: {
            gridId: 'gridTable',    // 你的表格ID
            fixedColumns: 4,        // 要固定的可见列数
            hiddenFirstColumn: true, // 第一列隐藏
            updateInterval: 100,    // 更新间隔(ms)
            debug: false           // 调试模式
        },
        
        // 初始化
        init: function(options) {
            $.extend(this.options, options);
            
            // 等待表格渲染完成
            this.waitForGrid();
        },
        
        // 等待表格渲染
        waitForGrid: function() {
            var self = this;
            var checkCount = 0;
            var maxChecks = 50; // 最多检查50次(5秒)
            
            var checkGrid = function() {
                var $grid = $('#' + self.options.gridId);
                var $table = $grid.find('.ui-jqgrid-btable');
                
                if ($table.length > 0 && $table.find('tbody tr').length > 0) {
                    self.debug('表格已就绪，开始应用固定列（第一列隐藏）');
                    setTimeout(function() {
                        self.applyFix();
                        self.bindEvents();
                    }, self.options.updateInterval);
                } else if (checkCount < maxChecks) {
                    checkCount++;
                    setTimeout(checkGrid, 100);
                } else {
                    self.debug('表格加载超时');
                }
            };
            
            checkGrid();
        },
        
        // 应用修复
        applyFix: function() {
            this.calculateAndApplyPositions();
            this.debug('固定列位置已更新（第一列隐藏）');
        },
        
        // 计算并应用位置
        calculateAndApplyPositions: function() {
            var $grid = $('#' + this.options.gridId);
            var $headerTable = $grid.find('.ui-jqgrid-htable');
            var $bodyTable = $grid.find('.ui-jqgrid-btable');
            
            if ($headerTable.length === 0 || $bodyTable.length === 0) {
                this.debug('表格元素未找到');
                return;
            }
            
            var $headerCells = $headerTable.find('thead tr:first th');
            var positions = this.calculatePositions($headerCells);
            
            this.applyCSSVariables(positions);
            this.applyDynamicStyles(positions);
        },
        
        // 计算位置 - 跳过第一列（隐藏列）
        calculatePositions: function($headerCells) {
            var positions = [0]; // 第二列（实际显示的第一列）位置为0
            
            // 从第二列开始计算（索引1），因为第一列是隐藏的
            for (var i = 1; i < this.options.fixedColumns + 1 && i < $headerCells.length; i++) {
                if (i === 1) {
                    // 第二列（实际显示的第一列）位置为0
                    positions[1] = 0;
                } else {
                    // 获取前一个可见列的宽度
                    var $prevCell = $headerCells.eq(i - 1);
                    var cellWidth = $prevCell.outerWidth(false); // 不包含margin
                    positions[i] = positions[i - 1] + cellWidth;
                }
                
                this.debug('列 ' + (i + 1) + ' (实际显示列 ' + i + ') 宽度: ' + 
                          ($headerCells.eq(i - 1).outerWidth(false) || 0) + 'px, 位置: ' + positions[i] + 'px');
            }
            
            return positions;
        },
        
        // 应用CSS变量
        applyCSSVariables: function(positions) {
            var root = document.documentElement;
            root.style.setProperty('--col2-width', (positions[2] || 30) + 'px');      // 第三列位置
            root.style.setProperty('--col2-3-width', (positions[3] || 60) + 'px');   // 第四列位置  
            root.style.setProperty('--col2-4-width', (positions[4] || 90) + 'px');   // 第五列位置
        },
        
        // 应用动态样式
        applyDynamicStyles: function(positions) {
            var styleId = 'sample-sticky-hidden-dynamic-style';
            $('#' + styleId).remove();
            
            var css = this.generateCSS(positions);
            $('<style id="' + styleId + '">' + css + '</style>').appendTo('head');
        },
        
        // 生成CSS - 适配隐藏第一列
        generateCSS: function(positions) {
            var gridId = this.options.gridId;
            var css = '';
            
            // 从第2列开始（因为第1列隐藏）
            for (var i = 1; i <= this.options.fixedColumns; i++) {
                var nthChild = i + 1; // DOM中的实际位置
                var leftPosition = positions[i] || 0;
                var zIndex = 11 - i;
                
                css += `
                    #${gridId} .ui-jqgrid-btable tbody tr td:nth-child(${nthChild}),
                    #${gridId} .ui-jqgrid-htable thead tr th:nth-child(${nthChild}) {
                        position: sticky !important;
                        left: ${leftPosition}px !important;
                        background: #fff !important;
                        z-index: ${zIndex} !important;
                        box-shadow: 1px 0 0 0 #ddd !important;
                        border-right: none !important;
                    }
                `;
                
                // 第一个可见列（第二列）添加左边框
                if (i === 1) {
                    css += `
                        #${gridId} .ui-jqgrid-btable tbody tr td:nth-child(${nthChild}),
                        #${gridId} .ui-jqgrid-htable thead tr th:nth-child(${nthChild}) {
                            border-left: 1px solid #ddd !important;
                        }
                    `;
                }
            }
            
            // 确保第一列隐藏
            css += `
                #${gridId} .ui-jqgrid-btable tbody tr td:first-child,
                #${gridId} .ui-jqgrid-htable thead tr th:first-child {
                    display: none !important;
                }
            `;
            
            // 添加悬停效果 - 从第2列到第5列
            var maxColumn = this.options.fixedColumns + 1;
            css += `
                #${gridId} .ui-jqgrid-btable tbody tr:hover td:nth-child(n+2):nth-child(-n+${maxColumn}) {
                    background: #f5f5f5 !important;
                }
                #${gridId} .ui-jqgrid-btable tbody tr.ui-state-highlight td:nth-child(n+2):nth-child(-n+${maxColumn}) {
                    background: #e6f3ff !important;
                }
            `;
            
            return css;
        },
        
        // 绑定事件
        bindEvents: function() {
            var self = this;
            var $grid = $('#' + this.options.gridId);
            
            // 监听窗口大小变化
            $(window).off('resize.sampleStickyFixHidden').on('resize.sampleStickyFixHidden', function() {
                clearTimeout(self.resizeTimer);
                self.resizeTimer = setTimeout(function() {
                    self.applyFix();
                }, 200);
            });
            
            // 监听jqGrid重新加载
            $grid.off('jqGridLoadComplete.stickyFixHidden').on('jqGridLoadComplete.stickyFixHidden', function() {
                setTimeout(function() {
                    self.applyFix();
                }, self.options.updateInterval);
            });
            
            // 监听列宽调整
            $grid.off('jqGridResizeStop.stickyFixHidden').on('jqGridResizeStop.stickyFixHidden', function() {
                setTimeout(function() {
                    self.applyFix();
                }, 50);
            });
        },
        
        // 调试输出
        debug: function(message) {
            if (this.options.debug) {
                console.log('[SampleGridStickyFixHidden] ' + message);
            }
        },
        
        // 销毁
        destroy: function() {
            $(window).off('resize.sampleStickyFixHidden');
            $('#' + this.options.gridId).off('jqGridLoadComplete.stickyFixHidden jqGridResizeStop.stickyFixHidden');
            $('#sample-sticky-hidden-dynamic-style').remove();
        }
    };
    
    // 全局暴露
    window.SampleGridStickyFixHidden = SampleGridStickyFixHidden;
    
    // jQuery插件形式
    $.fn.sampleStickyFixHidden = function(options) {
        return this.each(function() {
            var gridId = $(this).attr('id');
            if (gridId) {
                var opts = $.extend({}, options, { gridId: gridId });
                SampleGridStickyFixHidden.init(opts);
            }
        });
    };
    
})(jQuery);

/**
 * 使用方式（第一列隐藏版本）:
 * 
 * 1. 在initAnalyzeGrid函数完成后调用:
 * SampleGridStickyFixHidden.init({
 *     gridId: 'gridTable',
 *     fixedColumns: 4,    // 要固定的可见列数
 *     debug: true
 * });
 * 
 * 2. 或者使用jQuery插件形式:
 * $('#gridTable').sampleStickyFixHidden({
 *     fixedColumns: 4,
 *     debug: true
 * });
 * 
 * 3. 在refreshGrid函数中调用:
 * SampleGridStickyFixHidden.applyFix();
 */