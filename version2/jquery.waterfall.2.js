/*! by da宗熊  https://github.com/linfenpan/waterfall */
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}};(function($){var Waterfall=function(){function Waterfall(elem,options){_classCallCheck(this,Waterfall);this.$root=typeof elem==="string"?$(elem):elem;this.options={itemWidth:0.25,vertical:10,horizontal:10,fixHeight:true};this.addAnimate=this.removeAnimate=function($elem,callback){callback&&callback()};this.reflowAnimate=function($elem,position){$elem.css(position)};this.itemInitialStyle={};this.init(options||{})}_createClass(Waterfall,[{key:"init",value:function init(options){var $root=this.$root;var cssPosition="position";if($root.css(cssPosition)=="static"){$root.css(cssPosition,"relative")}this.reset(options)}},{key:"reset",value:function reset(options){var _this=this;$.extend(this.options,options||{});options=this.options;this.itemInitialStyle=options.initStyle||this.itemInitialStyle;var rootWidth=this.$root.outerWidth();this.rootWidth=rootWidth;var caculateIfPercent=function caculateIfPercent(width){if(width<=1){width=_this.rootWidth*width}return width};var itemWidth=this.itemWidth=caculateIfPercent(options.itemWidth);var itemVSpace=this.itemVSpace=caculateIfPercent(options.vertical);var itemHSpace=this.itemHSpace=caculateIfPercent(options.horizontal);var cellCount=Math.floor(rootWidth/itemWidth);while(cellCount*itemWidth+(cellCount-1)*itemHSpace>rootWidth){cellCount--}cellCount=cellCount||1;var leaveSpace=rootWidth-(cellCount*itemWidth+(cellCount-1)*itemHSpace);var startX=leaveSpace/2;this.startX=startX;var cells=[];for(var i=0,max=cellCount;i<max;i++){var x=startX+i*(itemHSpace+itemWidth),y=0;cells.push({x:x,y:y})};this.cells=cells;this.orignalCells=$.extend(true,[],cells);return this}},{key:"placeElement",value:function placeElement($elem){var cell=this.queryMinCell();var vertical=this.itemVSpace;var top=cell.y;var left=cell.x;$elem.css({left:cell.x,top:cell.y});cell.y+=$elem.outerHeight()+vertical;this.fixRootHeight();return {top:top,left:left}}},{key:"fixRootHeight",value:function fixRootHeight(){var fixHeight=this.options.fixHeight;var itemVSpace=this.itemVSpace;if(fixHeight){var cells=this.cells;var heights=[];for(var i=0,max=cells.length;i<max;i++){var item=cells[i];heights.push(item.y-itemVSpace)}var maxHeight=Math.max.apply(Math,heights);this.$root.height(Math.max(maxHeight,0))}}},{key:"initElememtStyle",value:function initElememtStyle($elem){$elem.css($.extend({position:"absolute",width:this.itemWidth},this.itemInitialStyle))}},{key:"queryMinCell",value:function queryMinCell(){this.cells.sort(function(a,b){return a.y>b.y?1:-1});var cell=this.cells[0];return cell}},{key:"getChildren",value:function getChildren(){return this.$root.children()}},{key:"add",value:function add(index,elem){if(typeof index!="number"){var _ref=[index,elem];elem=_ref[0];index=_ref[1]}var $elem=$(elem);this.initElememtStyle($elem);if(typeof index=="undefined"){$elem.appendTo(this.$root);this.placeElement($elem)}else {var $children=this.getChildren();if(index>=$children.size()){this.add(elem)}else {$children.eq(index).before($elem);this.reflow()}}this.addAnimate($elem);return this}},{key:"reflow",value:function reflow(){var _this2=this;var $children=this.getChildren();this.cells=$.extend(true,[],this.orignalCells);$children.each(function(i,v){var $elem=$(v);var oldPos=$elem.position();var newPos=_this2.placeElement($elem);$elem.css(oldPos);_this2.reflowAnimate($elem,newPos)});return this}},{key:"replace",value:function replace(index,elem){var _this3=this;var $children=this.getChildren();if(index>=$children.size()){this.add(elem)}else {var $cur=$children.eq(index);this.removeAnimate($cur,function(){$cur.remove();_this3.add(elem,index)})}return this}},{key:"remove",value:function remove(index){var _this4=this;var $children=this.getChildren();var $cur=$children.eq(index);if($cur.size()>0){this.removeAnimate($cur,function(){$cur.remove();_this4.reflow()})}return this}},{key:"setAddAnimate",value:function setAddAnimate(animate){this.addAnimate=animate;return this}},{key:"setRemoveAnimate",value:function setRemoveAnimate(animate){this.removeAnimate=animate;return this}},{key:"setReflowAnimate",value:function setReflowAnimate(animate){this.reflowAnimate=animate;return this}},{key:"resize",value:function resize(){this.reset().reflow();return this}}]);return Waterfall}();;$.fn.extend({waterfall:function waterfall(options){for(var _len=arguments.length,args=Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){args[_key-1]=arguments[_key]}this.each(function(i,v){var dataKey="waterfall";var $elem=$(v);var waterfall=$elem.data(dataKey);var optionsType=typeof options==="undefined"?"undefined":_typeof(options);if(waterfall){switch(optionsType){case "string":var method=waterfall[options];method.apply(waterfall,args);break;case "function":var fn=options;fn.call($elem,waterfall);break;}}else {waterfall=new Waterfall($elem,options);$elem.data(dataKey,waterfall)}});return this}})})($);
