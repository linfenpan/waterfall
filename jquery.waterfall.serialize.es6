/*! by da宗熊  https://github.com/linfenpan/waterfall */
;(function($){
    class Waterfall {
        constructor(elem, options) {
            this.$root = typeof elem === "string" ? $(elem) : elem;
            this.options = {
                // 小于 等于 1，则作为百分比计算
                itemWidth: 0.25,
                // 垂直间距
                vertical: 10,
                // 水平间距
                horizontal: 10,
                // 修正 $root 高度
                fixHeight: true
            };
            this.addAnimate = this.removeAnimate = function($elem, next){
                next();
            };
            this.reflowAnimate = function($elem, position, next) {
                $elem.css(position);
                next();
            };
            this.itemInitialStyle = {  };

            this._init(options || {});
        }

        _init(options) {
            var $root = this.$root;
            var cssPosition = "position";
            if ($root.css(cssPosition) == "static") {
                $root.css(cssPosition, "relative");
            }

            this.reset(options);
        }

        reset(options) {
            $.extend(this.options, options || {});
            options = this.options;

            // item 初始化样式
            this.itemInitialStyle = options.initStyle || this.itemInitialStyle;

            // 容器宽度
            var rootWidth = this.$root.outerWidth();
            this.rootWidth = rootWidth;

            var caculateIfPercent = (width) => {
                if (width <= 1) {
                    width = this.rootWidth * width;
                }
                return width;
            };

            // 子项宽度
            var itemWidth = this.itemWidth = caculateIfPercent(options.itemWidth);

            // 子项的间距
            var itemVSpace = this.itemVSpace = caculateIfPercent(options.vertical);
            var itemHSpace = this.itemHSpace = caculateIfPercent(options.horizontal);

            // 容纳列数、起始x轴坐标
            var cellCount = Math.floor(rootWidth / itemWidth);
            while((cellCount * itemWidth + (cellCount - 1) * itemHSpace) > rootWidth){
                cellCount--;
            }
            cellCount = cellCount || 1;
            var leaveSpace = rootWidth - (cellCount * itemWidth + (cellCount - 1) * itemHSpace);
            var startX = leaveSpace / 2;
            this.startX = startX;

            // 初始化列表的起始坐标
            this.cellCount = cellCount;
            this._resetCells();

            return this;
        }

        _resetCells() {
            var {cellCount, itemHSpace, itemWidth, startX} = this;
            var cells = [];
            for (let i = 0, max = cellCount; i < max; i++) {
                let x = startX + i * (itemHSpace + itemWidth), y = 0;
                cells.push({x, y});
            };
            this.cells = cells;
        }

        _placeElement($elem) {
            var cell = this._queryMinCell();
            var vertical = this.itemVSpace;
            var {y: top, x: left} = cell;
            $elem.css({
                left: cell.x,
                top: cell.y
            });
            cell.y += $elem.outerHeight() + vertical;

            this._fixRootHeight();
            return {top, left};
        }

        _fixRootHeight() {
            var fixHeight = this.options.fixHeight;
            var itemVSpace = this.itemVSpace;
            if (fixHeight) {
                let cells = this.cells;
                let heights = [];
                for (let i = 0, max = cells.length; i < max; i++) {
                    let item = cells[i];
                    heights.push(item.y - itemVSpace);
                }
                let maxHeight = Math.max.apply(Math, heights);
                this.$root.height(Math.max(maxHeight, 0));
            }
        }

        _initElememtStyle($elem) {
            $elem.css(
                $.extend({ position: "absolute", width: this.itemWidth }, this.itemInitialStyle)
            );
        }

        _queryMinCell() {
            this.cells.sort(function(a, b){
                return a.y > b.y ? 1 : -1;
            });
            var cell = this.cells[0];
            return cell;
        }

        _getChildren() {
            return this.$root.children();
        }

        setAddAnimate(animate) {
            this.addAnimate = animate;
            return this;
        }

        setRemoveAnimate(animate) {
            this.removeAnimate = animate;
            return this;
        }

        setReflowAnimate(animate) {
            this.reflowAnimate = animate;
            return this;
        }
    };

    var prototype = Waterfall.prototype;


    // 添加 wait/notify 功能
    //      wait 时，阻塞之后的操作，直到 notify 被调用，才解锁
    $.extend(prototype, {
        waitStack: [],
        isWait: false,
        wait() {
            this.isWait = true;
            return this;
        },
        notify() {
            // 同步调用，会产生bug
            setTimeout(() => {
                this.isWait = false;
                this.popStack();
            });
            return this;
        },
        pushStack(fn, args) {
            this.waitStack.push(() => {
                fn.apply(this, args);
            });
            if (!this.isWait) {
                this.popStack();
            }
            return this;
        },
        popStack() {
            if (!this.isWait) {
                let fn = this.waitStack.shift();
                if (fn) {
                    fn();
                    this.popStack();
                }
            }
            return this;
        }
    });


    // 添加 add/remove/replace/reflow/resize 功能
    //      这些功能，都可以配合 wait 一起使用
    $.extend(prototype, {
        add(index, elem) {
            if (typeof index != "number") {
                [elem, index] = [index, elem];
            }
            var $elem = $(elem);
            var $children = this._getChildren();
            this._initElememtStyle($elem);

            if (typeof index == "undefined" || index >= $children.size()) {
                // 只刷新最后一个
                $elem.appendTo(this.$root);
                this._placeElement($elem);
            } else {
                // 更新整个元素列表
                $children.eq(index).before($elem);
                this.reflow();
            }

            this.addAnimate($elem, () => {
                this.notify();
            });

            return this;
        },

        remove(index) {
            if (typeof index != "number") {
                index = $(index).index();
            }
            var $children = this._getChildren();
            var $cur = $children.eq(index);
            if ($cur.size() > 0) {
                this.removeAnimate($cur, () => {
                    $cur.remove();
                    this.notify();
                    this.reflow();
                });
            } else {
                this.notify();
            }
            return this;
        },

        replace(index, elem) {
            if (typeof index != "number") {
                index = $(index).index();
            }
            var $children = this._getChildren();
            if (index >= $children.size()) {
                this.add(elem);
            } else {
                this.remove(index).wait().add(elem, index);
            }
            return this;
        },

        reflow() {
            var $children = this._getChildren();
            // 清空 cells 的y坐标
            this._resetCells();

            var size = $children.size();
            $children.each((i, v) => {
                var $elem = $(v);
                var oldPos = $elem.position();

                var newPos = this._placeElement($elem);

                // 复位，把动画，交给外部处理
                $elem.css(oldPos);
                this.reflowAnimate($elem, newPos, () => {
                    if (i + 1 >= size) {
                        this.notify();
                    }
                });
            });

            return this;
        },

        resize() {
            this.reset().reflow();
            return this;
        }
    });


    // 修正有 notify 功能的函数
    var waitList = "add,remove,replace,reflow,resize,reset,wait".split(",");
    for (let i = 0, max = waitList.length; i < max; i++) {
        let key = waitList[i];
        let orignalFn = prototype[key];
        prototype[key] = function(...args){
            this.pushStack(orignalFn, args);
            return this;
        };
    };


    $.fn.extend({
        waterfall: function(options, ...args) {
            this.each((i, v) => {
                var dataKey = "waterfall";
                var $elem = $(v);
                var waterfall = $elem.data(dataKey);

                var optionsType = typeof options;
                if (waterfall) {
                    switch(optionsType) {
                        case "string":
                            let method = waterfall[options];
                            method.apply(waterfall, args);
                            break;
                        case "function":
                            let fn = options;
                            fn.call($elem, waterfall);
                            break;
                    }
                } else {
                    waterfall = new Waterfall($elem, options);
                    $elem.data(dataKey, waterfall);
                }
            });
            return this;
        }
    });
})($);
