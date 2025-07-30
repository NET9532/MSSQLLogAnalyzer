/**
 * jqGrid 固定列稳定修复 - 解决拖动晃动问题
 * 第一列隐藏版本
 */

(function($) {
    'use strict';
    
    var StableStickyFix = {
        options: {
            gridId: 'gridTable',
            fixedColumns: 4,
            debug: false
        },
        
        // 缓存的列宽度
        cachedWidths: [],
        
        // 初始化
        init: function(options) {
            $.extend(this.options, options);
            this.waitForGrid();
        },
        
        // 等待表格就绪
        waitForGrid: function() {
            var self = this;
            var checkCount = 0;
            var maxChecks = 50;
            
            var checkGrid = function() {
                var $grid = $('#' + self.options.gridId);
                var $table = $grid.find('.ui-jqgrid-btable');
                
                if ($table.length > 0 && $table.find('tbody tr').length > 0) {
                    self.debug('表格就绪，应用稳定固定列');
                    setTimeout(function() {
                        self.applyStableFix();
                        self.bindEvents();
                    }, 100);
                } else if (checkCount < maxChecks) {
                    checkCount++;
                    setTimeout(checkGrid, 100);
                }
            };
            
            checkGrid();
        },
        
        // 应用稳定的固定列
        applyStableFix: function() {
            var positions = this.calculatePrecisePositions();
            this.applyImmediateStyles(positions);
            this.debug('稳定固定列已应用，位置：' + JSON.stringify(positions));
        },
        
        // 精确计算位置
        calculatePrecisePositions: function() {
            var $grid = $('#' + this.options.gridId);
            var $headerTable = $grid.find('.ui-jqgrid-htable');
            
            if ($headerTable.length === 0) {
                return [0, 0, 0, 0, 0];
            }
            
            var $headerCells = $headerTable.find('thead tr:first th');
            var positions = [0]; // 第一列隐藏，第二列位置为0
            
            // 强制重新计算布局
            $headerTable[0].offsetHeight; // 触发重排
            
            // 计算每列的精确位置
            for (var i = 1; i < this.options.fixedColumns + 1 && i < $headerCells.length; i++) {
                if (i === 1) {
                    positions[1] = 0; // 第二列（显示的第一列）
                } else {
                    var $cell = $headerCells.eq(i - 1);
                    // 使用 getBoundingClientRect 获取更精确的尺寸
                    var rect = $cell[0].getBoundingClientRect();
                    var width = Math.round(rect.width);
                    positions[i] = positions[i - 1] + width;
                }
                
                this.debug('列 ' + (i + 1) + ' 位置: ' + positions[i] + 'px');
            }
            
            // 缓存宽度用于比较
            this.cachedWidths = positions.slice();
            
            return positions;
        },
        
        // 立即应用样式（不使用CSS变量）
        applyImmediateStyles: function(positions) {
            var styleId = 'stable-sticky-style';
            $('#' + styleId).remove();
            
            var css = this.generateStableCSS(positions);
            $('<style id="' + styleId + '">' + css + '</style>').appendTo('head');
        },
        
        // 生成稳定的CSS
        generateStableCSS: function(positions) {
            var gridId = this.options.gridId;
            var css = '';
            
            // 基础样式
            css += `
                #${gridId} .ui-jqgrid-btable tbody tr td,
                #${gridId} .ui-jqgrid-htable thead tr th {
                    box-sizing: border-box;
                }
                
                #${gridId} .ui-jqgrid-btable tbody tr td:first-child,
                #${gridId} .ui-jqgrid-htable thead tr th:first-child {
                    display: none !important;
                }
                
                #${gridId} .ui-jqgrid-btable tbody tr td {
                    border-left: none !important;
                }
                
                #${gridId} .ui-jqgrid-htable thead tr th {
                    border-left: none !important;
                }
                
                #${gridId} .ui-jqgrid-bdiv {
                    overflow-x: auto !important;
                }
            `;
            
            // 为每个固定列生成精确的样式
            for (var i = 1; i <= this.options.fixedColumns; i++) {
                var nthChild = i + 1; // DOM中的实际位置（跳过隐藏的第一列）
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
                        will-change: transform !important;
                        transform: translateZ(0) !important;
                    }
                `;
                
                // 第一个可见列添加左边框
                if (i === 1) {
                    css += `
                        #${gridId} .ui-jqgrid-btable tbody tr td:nth-child(${nthChild}),
                        #${gridId} .ui-jqgrid-htable thead tr th:nth-child(${nthChild}) {
                            border-left: 1px solid #ddd !important;
                        }
                    `;
                }
            }
            
            // 悬停和选中效果
            var maxColumn = this.options.fixedColumns + 1;
            css += `
                #${gridId} .ui-jqgrid-btable tbody tr:hover td:nth-child(n+2):nth-child(-n+${maxColumn}) {
                    background: #f5f5f5 !important;
                }
                #${gridId} .ui-jqgrid-btable tbody tr.ui-state-highlight td:nth-child(n+2):nth-child(-n+${maxColumn}) {
                    background: #e6f3ff !important;
                }
                
                #${gridId} .ui-jqgrid-btable tbody tr td:nth-child(n+${maxColumn + 1}),
                #${gridId} .ui-jqgrid-htable thead tr th:nth-child(n+${maxColumn + 1}) {
                    position: relative;
                    z-index: 1;
                }
            `;
            
            return css;
        },
        
        // 检查是否需要更新
        needsUpdate: function() {
            var currentPositions = this.calculatePrecisePositions();
            
            // 比较与缓存的差异
            for (var i = 0; i < currentPositions.length; i++) {
                if (Math.abs(currentPositions[i] - (this.cachedWidths[i] || 0)) > 1) {
                    return true;
                }
            }
            
            return false;
        },
        
        // 绑定事件
        bindEvents: function() {
            var self = this;
            var $grid = $('#' + this.options.gridId);
            
            // 窗口大小变化 - 防抖处理
            var resizeTimer;
            $(window).off('resize.stableStickyFix').on('resize.stableStickyFix', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    if (self.needsUpdate()) {
                        self.applyStableFix();
                    }
                }, 150);
            });
            
            // 表格重新加载
            $grid.off('jqGridLoadComplete.stableStickyFix').on('jqGridLoadComplete.stableStickyFix', function() {
                setTimeout(function() {
                    self.applyStableFix();
                }, 100);
            });
            
            // 列宽调整完成
            $grid.off('jqGridResizeStop.stableStickyFix').on('jqGridResizeStop.stableStickyFix', function() {
                setTimeout(function() {
                    self.applyStableFix();
                }, 50);
            });
            
            // 监听滚动事件，确保固定列保持稳定
            var $bdiv = $grid.find('.ui-jqgrid-bdiv');
            $bdiv.off('scroll.stableStickyFix').on('scroll.stableStickyFix', function() {
                // 在滚动时不重新计算，避免晃动
                // 只是确保层级正确
                var $fixedCells = $grid.find('.ui-jqgrid-btable tbody tr td:nth-child(-n+' + (self.options.fixedColumns + 1) + '):nth-child(n+2)');
                $fixedCells.css('z-index', function(index) {
                    return 10 - Math.floor(index / $grid.find('.ui-jqgrid-btable tbody tr').length);
                });
            });
        },
        
        // 调试输出
        debug: function(message) {
            if (this.options.debug) {
                console.log('[StableStickyFix] ' + message);
            }
        },
        
        // 销毁
        destroy: function() {
            $(window).off('resize.stableStickyFix');
            $('#' + this.options.gridId).off('jqGridLoadComplete.stableStickyFix jqGridResizeStop.stableStickyFix');
            $('#' + this.options.gridId).find('.ui-jqgrid-bdiv').off('scroll.stableStickyFix');
            $('#stable-sticky-style').remove();
        },
        
        // 手动刷新
        refresh: function() {
            this.applyStableFix();
        }
    };
    
    // 全局暴露
    window.StableStickyFix = StableStickyFix;
    
    // jQuery插件
    $.fn.stableStickyFix = function(options) {
        return this.each(function() {
            var gridId = $(this).attr('id');
            if (gridId) {
                var opts = $.extend({}, options, { gridId: gridId });
                StableStickyFix.init(opts);
            }
        });
    };
    
})(jQuery);

/**
 * 使用方式:
 * 
 * // 初始化
 * StableStickyFix.init({
 *     gridId: 'gridTable',
 *     fixedColumns: 4,
 *     debug: true
 * });
 * 
 * // 手动刷新
 * StableStickyFix.refresh();
 * 
 * // 销毁
 * StableStickyFix.destroy();
 */