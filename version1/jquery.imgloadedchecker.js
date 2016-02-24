/*
* $.imgLoadedChecker : jQuery Plugin
* description: HTML 代码 图片 加载 完成 检测
* dependence: [jQuery.js]
* version: 1.0.0
* author: da宗熊
* last modified: 2014/05/22 by da宗熊
* e-mail: 384858402@qq.com
* example:
    * var checker = $.imgLoadedChecker("图片加载失败时的替换图片 路径");
    * checker.addLoadedListener(function(回调元素索引, $elem){ //图片加载 后 的 回调 函数 });
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/
;(function($){

   function checker(){}

   checker.prototype = {
       event:{
           load: "load.check.height"
           ,error: "error.check.height"
           ,fire: "checker.finish"
       }
       ,initialize: function(src){
           this.defaultSrc = src;
           this.index = 0;
           this.root = $("<div></div>");
           this.root.css({
               position: "absolute"
               ,zIndex: "-1"
               ,opacity: 0
               ,visibility: "hidden"
               ,height: 0
               ,width:0
               ,overflow: "hidden"
           }).appendTo("body");
           return this;
       }
       ,addLoadedListener: function(cb){
           var that = this;
           this.root.on(this.event.fire, function(e, data){
               cb.call(that, data.index, data.elem);
           });
       }
       ,check: function(html,option){
           var _opt=option||{};
           var index = ++this.index;
           var $elem = $(html),
               list = $elem.find("img"),
               size = list.length;
           var count = 0, that = this;
           if(!_opt.knowSize){
               list.on(this.event.load + " " + this.event.error, function(event){
               if(event.type == "error" && this.src != that.defaultSrc){
                   $(this).attr("src", that.defaultSrc);
                   return;
               }
               count++;
               if(count == size){
                   list.off(that.event.load + " " + that.event.error);
                   that.root.trigger(that.event.fire, {index:index, elem:$elem});
               }
               });
               this.root.append($elem);
           }else{
               this.root.append($elem);
               that.root.trigger(that.event.fire, {index:index, elem:$elem});
           }
           // 一定 要 在 绑定 之后 插入，免得不触发 load 事件

       }
   };

   $.imgLoadedChecker = function(src){
       return (new checker()).initialize(src);
   }

})(jQuery);
