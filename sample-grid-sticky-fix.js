/**
 * 样本页面 jqGrid 固定列精确修复
 * 专门解决1像素偏移问题
 */

(function($) {
    'use strict';
    
    var SampleGridStickyFix = {
        // 配置选项
        options: {
            gridId: 'gridTable', // 你的表格ID
            fixedColumns: 4,     // 固定列数
            updateInterval: 100, // 更新间隔(ms)
            debug: false         // 调试模式
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
                    self.debug('表格已就绪，开始应用固定列');
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
            this.debug('固定列位置已更新');
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
        
        // 计算位置
        calculatePositions: function($headerCells) {
            var positions = [0]; // 第一列始终为0
            
            for (var i = 1; i < this.options.fixedColumns && i < $headerCells.length; i++) {
                var $prevCell = $headerCells.eq(i - 1);
                var cellWidth = $prevCell.outerWidth(false); // 不包含margin
                positions[i] = positions[i - 1] + cellWidth;
                
                this.debug('列 ' + i + ' 宽度: ' + cellWidth + 'px, 位置: ' + positions[i] + 'px');
            }
            
            return positions;
        },
        
        // 应用CSS变量
        applyCSSVariables: function(positions) {
            var root = document.documentElement;
            root.style.setProperty('--col1-width', (positions[1] || 30) + 'px');
            root.style.setProperty('--col1-2-width', (positions[2] || 60) + 'px');
            root.style.setProperty('--col1-3-width', (positions[3] || 90) + 'px');
        },
        
        // 应用动态样式
        applyDynamicStyles: function(positions) {
            var styleId = 'sample-sticky-dynamic-style';
            $('#' + styleId).remove();
            
            var css = this.generateCSS(positions);
            $('<style id="' + styleId + '">' + css + '</style>').appendTo('head');
        },
        
        // 生成CSS
        generateCSS: function(positions) {
            var gridId = this.options.gridId;
            var css = '';
            
            for (var i = 0; i < this.options.fixedColumns; i++) {
                var nthChild = i + 1;
                var leftPosition = positions[i] || 0;
                var zIndex = 10 - i;
                
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
            }
            
            // 添加第一列的左边框
            css += `
                #${gridId} .ui-jqgrid-btable tbody tr td:first-child,
                #${gridId} .ui-jqgrid-htable thead tr th:first-child {
                    border-left: 1px solid #ddd !important;
                }
            `;
            
            // 添加悬停效果
            css += `
                #${gridId} .ui-jqgrid-btable tbody tr:hover td:nth-child(-n+${this.options.fixedColumns}) {
                    background: #f5f5f5 !important;
                }
                #${gridId} .ui-jqgrid-btable tbody tr.ui-state-highlight td:nth-child(-n+${this.options.fixedColumns}) {
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
            $(window).off('resize.sampleStickyFix').on('resize.sampleStickyFix', function() {
                clearTimeout(self.resizeTimer);
                self.resizeTimer = setTimeout(function() {
                    self.applyFix();
                }, 200);
            });
            
            // 监听jqGrid重新加载
            $grid.off('jqGridLoadComplete.stickyFix').on('jqGridLoadComplete.stickyFix', function() {
                setTimeout(function() {
                    self.applyFix();
                }, self.options.updateInterval);
            });
            
            // 监听列宽调整
            $grid.off('jqGridResizeStop.stickyFix').on('jqGridResizeStop.stickyFix', function() {
                setTimeout(function() {
                    self.applyFix();
                }, 50);
            });
        },
        
        // 调试输出
        debug: function(message) {
            if (this.options.debug) {
                console.log('[SampleGridStickyFix] ' + message);
            }
        },
        
        // 销毁
        destroy: function() {
            $(window).off('resize.sampleStickyFix');
            $('#' + this.options.gridId).off('jqGridLoadComplete.stickyFix jqGridResizeStop.stickyFix');
            $('#sample-sticky-dynamic-style').remove();
        }
    };
    
    // 全局暴露
    window.SampleGridStickyFix = SampleGridStickyFix;
    
    // jQuery插件形式
    $.fn.sampleStickyFix = function(options) {
        return this.each(function() {
            var gridId = $(this).attr('id');
            if (gridId) {
                var opts = $.extend({}, options, { gridId: gridId });
                SampleGridStickyFix.init(opts);
            }
        });
    };
    
})(jQuery);

/**
 * 使用方式:
 * 
 * 1. 在initAnalyzeGrid函数完成后调用:
 * SampleGridStickyFix.init({
 *     gridId: 'gridTable',
 *     fixedColumns: 4,
 *     debug: true
 * });
 * 
 * 2. 或者使用jQuery插件形式:
 * $('#gridTable').sampleStickyFix({
 *     fixedColumns: 4,
 *     debug: true
 * });
 * 
 * 3. 在refreshGrid函数中调用:
 * SampleGridStickyFix.applyFix();
 */