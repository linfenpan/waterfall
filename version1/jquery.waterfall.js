/*
* $.WaterfallLayout : jQuery Plugin
* description: jQuery 简单瀑布流 插件
* dependence: [jQuery.js]
* version: 1.0.0
* author: da宗熊
* last modified: 2014/05/22 by da宗熊
* e-mail: 384858402@qq.com
* example:
    * var waterfall = $.WaterfallLayout($element, {配置 文件});
    * 配置项：
    *		minWidth: 300 // $element 的至少 宽度
    *		itemWidth: 300 // $element 中 瀑布 排列元素 的 宽度
    *		cellWSpace: 10 // 宽度 间隔
    *		cellHSpace: 10 // 高度间隔
    *		cachePerSecond: 10 // 缓存 加载 10个/s
    *		resetSpaceTime: 10 // 元素重设位置 的 时间间隔
    * waterfall.appendItem(需要插入的元素, 元素的高度?, 元素样式?); // 如果 插入 已加载完成 的元素，不需要设置高
    * waterfall.prependItem // 与上面一直，插入到根的第一位
    
http://www.100bt.com/resource/js/plugins/waterfall/demo/waterfall.html
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/
;(function($){

   var dc = {
       minWidth: 300	// 如果 不设定，则没有 最少列
       ,itemWidth: 300 // 元素 宽度
       ,cellWSpace: 10 // 元素 宽度 间隔
       ,cellHSpace: 10 // 元素 高度 间隔
       ,cachePerSecond: 10 // 每秒 读取 缓存 多少 条数据
       ,resetSpaceTime: 10 // 每 个 元素 重设 时， 运动 的 间隔
       ,resizeTimethreshold: 1000 // 多少毫秒后才出发resize的响应
       ,isStop:false//暂停
   };

   function waterfall(){};

   waterfall.prototype = {
       initialize: function($elem, config, isReseting){

           this.root = $elem;
           this.config = $.extend({}, dc, config || {});
           // 1、计算 当前root 宽度
           this.root.css("width", "100%");
           this.maxWidth = this.root.width();
           if(this.maxWidth < this.config.minWidth){
               this.maxWidth = this.config.minWidth;
               this.root.css("width", this.config.minWidth);
           }

           // 2、计算 root 的 初始 偏移
           this.left = parseInt(this.root.css("padding-left")) || 0;
           this.top = parseInt(this.root.css("padding-top")) || 0;

           // 3.1、计算 容纳的最大列数
           var maxColumns = 1;
           var leaveSpace = 0;
           if(this.maxWidth > this.config.itemWidth){
               maxColumns = Math.floor(this.maxWidth / this.config.itemWidth);
               leaveSpace = this.maxWidth - this.config.itemWidth * maxColumns;	// 剩余 间隔 宽度
               // 总列数 的 间距 = (列数 - 1) * 间距
               // 间距 不足，则减少 列数，直到 间距 足够 为止
               var totalSpace = (maxColumns - 1) * this.config.cellWSpace;
               while(totalSpace > leaveSpace){
                   leaveSpace += this.config.itemWidth;
                   maxColumns--;
               }
           }
           this.leaveSpace = leaveSpace;
           this.maxColumns = maxColumns;

           // 3.2、初始的 x/y 轴坐标
           this.initX = this.left + (this.leaveSpace - (this.maxColumns - 1) * this.config.cellWSpace);
           this.initX /= 2;
           this.initY = this.top;
           // 3.3、列的初始 x/y 轴坐标
           this.columnsArray = [];
           for(var i = 0, cur = 0; i < this.maxColumns; i++){
               var obj = {};
               if(i == 0){
                   obj.x = this.initX;
                   cur = this.initX;
               }else{
                   cur += this.config.itemWidth + this.config.cellWSpace;
                   obj.x = cur;
               }
               obj.y = this.initY;
               obj.index=i;
               this.columnsArray.push(obj);
           }

           // 如果 不是 在 调用 reset 方法
           if(!isReseting){
               // 3.4、缓存 列表
               this.cacheList = [];

               // 4、进行样式绑定
               this.bindUI();
           }

       }
       ,destroy: function(){
           this.root.css(this.defaultCss);
           this.root.empty();
       }
       ,bindUI: function(){
           var pos = this.root.css("position"),
               height = this.root.css("height"),
               that = this;
           // 1、记录默认修改属性，在 destroy 时 使用
           this.defaultCss = {
               position: pos
               ,height: height
           };

           // 2、重设 父 元素 的属性
           this.root.css({
               position:"relative"
               ,height: "auto"
           });

           $(window).on("resize.waterfall", function(){
               if(that.isStop){return;}
               clearTimeout(that.resizeTimer)
               that.resizeTimer=setTimeout(function(){
                   that.reset.call(that);
               },that.config.resizeTimethreshold);
           });
       }
       ,render: function(root, config){
           this.initialize(root, config);
           return this;
       }
       ,fire: function(evt, data){
           this.root.trigger(evt, data);
       }
       ,on: function(evt, func){
           this.root.on(evt, $.proxy(func, this));
       }
       ,setAnimate: function(animate){
           this.animate = animate || function(){};
           return this;
       }
       ,prependItem: function(elem, height, css){
           // 在 最 前方 插入 项
           this._addItem(elem, height, css, true);
           this.reset();
       }
       ,appendItem: function(elem, height, css){
           // 通过 列表，进行 插入 的 缓冲
           this._autoInsertItem(this._buildCacheItem(elem, height, css));
           return this;
       }
       ,reset: function(){
           // 觉得 当前 排版 不正确，调用 reset 重置 元素 的 位置
           // 1、停止计时器 的 插入
           this.reseting = true;

           // 2、重新 计算 位置
           this.initialize(this.root, this.config, true);

           this.fire("beforeReset");

           // 3、找到 所有 需要 重设 的 元素
           var $list = this.root.find(">div");


           // 4、获取 重新 排列 的 数组
           var operationList = [].slice.call($list.map(function(i, v){
               var $elem = $(v), height = $elem.height();
               return {
                   elem: $elem
                   ,height: height
               };
           }), 0);

           // 5、重新排位
           var that = this;
           var speed = 1000 / this.config.cachePerSecond;
           clearInterval(this.resetTimer);
           this.resetTimer = setInterval(function(){
               if(operationList.length <= 0){
                   clearInterval(that.resetTimer);
                   // 重新开启 计时器 的 插入
                   that.reseting = false;
                   that._reflow();
                   that.fire("reflow");
                   return;
               }

               // 列表还有数据，就重新排列
               var item = operationList.shift();
               var elem = item.elem;

               var arr = that.columnsArray;
               elem.animate({
                   top: arr[0].y
                   ,left: arr[0].x
               }, speed);

               arr[0].y += that.config.cellHSpace + item.height;

               that._sort();
           }, this.config.resetSpaceTime || speed);

           this.fire("reset");
       }
       ,_reflow:function(){
           this.root.css("zoom", 1).css("zoom", 0);
       }
       ,_buildCacheItem: function(elem, height, css){
           return {
               elem: elem
               ,height: height
               ,css: css
           };
       }
       ,_autoInsertItem: function(item){
           // 缓存 插入
           this.cacheList.push(item);

           var list = this.cacheList, that = this;

           if(!this.cacheTimer){
               clearInterval(this.cacheTimer);
               this.cacheTimer = setInterval(function(){
                   if(that.reseting) return; // 如果 正在 重设中，就延迟插入
                   var item = list.shift();
                   that._addItem(item.elem, item.height, item.css);
                   if(list.length <= 0){
                       clearInterval(that.cacheTimer);
                       that.cacheTimer = null;
                   }
               }, 1000 / this.config.cachePerSecond);
           }
       }
       ,_addItem: function(elem, height, css, isPrepend){
           var width = this.config.itemWidth, height = height || "auto";
           var arr = this.columnsArray;

           // 1、在当前 列 插入 新的 元素
           var $e = $("<div></div>").css({
               position: "absolute"
               ,width: width
               ,height: height
               ,top: arr[0].y
               ,left: arr[0].x
           });
           css && $e.css(css);	// 有自定义样式，就自己玩吧
           $e.append(elem);
           this.root[isPrepend ? "prepend" : "append"]($e);
           height = $e.height();	// 如果 没 设置 高度，就自动 读取 呗
           this.animate && this.animate(elem);	// 设置 出现 动画

           // 2、当前 列 高度 增长，并重排列
           arr[0].y += height + this.config.cellHSpace;
           this.fire("addItem", {elem: $e});

           // 3、只有 检测 通过 数组 才会重排
           // 	  检测 不通过，就会把元素重排
           if(this._check()){
               this._sort();
           }else{
               // 重设 当前 所有 元素 的位置
               // 不用 关心 timer 会 停止，因为 设置了 reseting 位，会暂时 停止 计时器
               this.reset();
           }
       }
       ,_check: function(){
           // 1、每次 插入，检测根元素 宽度 是否改变了
           return this.maxWidth == this.root.width();
       }
       ,_sort: function(){
           // 1、每次 插入 元素， 需对 插入 的列，进行冒泡 升序 排列
           this.columnsArray.sort(function(a, b){
               if(a.y>b.y){
                   return 1
               }else if(a.y==b.y){
                   if(a.index>b.index){
                       return 1
                   }else{
                       return -1
                   }
               }else{
                   return -1
               }
           });
           var that=this.columnsArray;
           // $.each(that,function(k,v){
           // 	that[k].index=k;
           // });
       }
   }

   $.WaterfallLayout = function(root, config){
       return (new waterfall()).render(root, config);
   };
})(jQuery);
