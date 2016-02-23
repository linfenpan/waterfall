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
            this.addAnimate = this.removeAnimate = function($elem, callback){
                callback && callback();
            };
            this.reflowAnimate = function($elem, position) {
                $elem.css(position);
            };
            this.itemInitialStyle = {  };

            this.init(options || {});
        }

        init(options) {
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
            var cells = [];
            for (let i = 0, max = cellCount; i < max; i++) {
                let x = startX + i * (itemHSpace + itemWidth), y = 0;
                cells.push({x, y});
            };
            this.cells = cells;
            this.orignalCells = $.extend(true, [], cells);

            return this;
        }

        placeElement($elem) {
            var cell = this.queryMinCell();
            var vertical = this.itemVSpace;
            var {y: top, x: left} = cell;
            $elem.css({
                left: cell.x,
                top: cell.y
            });
            cell.y += $elem.outerHeight() + vertical;
            return {top, left};
        }

        initElememtStyle($elem) {
            $elem.css(
                $.extend({ position: "absolute", width: this.itemWidth }, this.itemInitialStyle)
            );
        }

        queryMinCell() {
            this.cells.sort(function(a, b){
                return a.y > b.y ? 1 : -1;
            });
            var cell = this.cells[0];
            return cell;
        }

        getChildren() {
            return this.$root.children();
        }

        add(elem, index) {
            var $elem = $(elem);
            this.initElememtStyle($elem);

            if (typeof index == "undefined") {
                // 只刷新最后一个
                $elem.appendTo(this.$root);
                this.placeElement($elem);
            } else {
                // 整个元素列表，更新吧~!!!
                var $children = this.getChildren();
                if (index >= $children.size()) {
                    this.add(elem);
                } else {
                    $children.eq(index).before($elem);
                    this.reflow();
                }
            }
            this.addAnimate($elem);

            return this;
        }

        reflow() {
            var $children = this.getChildren();
            // 清空 cells 的y坐标
            this.cells = $.extend(true, [], this.orignalCells);

            $children.each((i, v) => {
                var $elem = $(v);
                var oldPos = $elem.position();

                var newPos = this.placeElement($elem);

                // 复位，把动画，交给外部处理
                $elem.css(oldPos);
                this.reflowAnimate($elem, newPos);
            });

            return this;
        }

        replace(index, elem) {
            var $children = this.getChildren();
            if (index >= $children.size()) {
                this.add(elem);
            } else {
                var $cur = $children.eq(index);
                this.removeAnimate($cur, () => {
                    $cur.remove();
                    this.add(elem, index);
                });
            }
            return this;
        }

        remove(index) {
            var $children = this.getChildren();
            var $cur = $children.eq(index);
            if ($cur.size() > 0) {
                this.removeAnimate($cur, () => {
                    $cur.remove();
                    this.reflow();
                });
            }
            return this;
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

        resize() {
            this.reset().reflow();
            return this;
        }
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
