# 简介

简单瀑布流，jquery插件。
可进行固定位置替换、插入、删除等操作，更添加了等待处理，如删除之后，才执行新增。


# 创建

快捷创建插件，附上 demo地址: [demo](http://linfenpan.github.io/demo/waterfall/index.html)
``` javascript
var options = { /* 参数 */ };
$("#waterfall").waterfall(options);
```

options的参数:

	1. itemWidth   子项的宽度 [default: 0.25]
	2. vertical   子项的垂直距离 [default: 10]
	3. horizontal  子项的水平距离 [default: 10]
	4. fixHeight  是否在新增子项时，修正根元素的高度 [default: true]
	5. initStyle 每个子项在插入前，预设的样式 [default: {  }]，请不要设置宽度和高度

当 itemWidth/vertical/horizontal 的值大于0且小于或等于1时，代表跟元素宽度的百分比。
如 itemWidth: 0.25，代表子项的宽度，是根元素宽度的 25%


# 方法

调用插件的方法， 有两种形式。
形式1:
``` javascript
$root.waterfall("add", '<div class="item">新增元素</div>');
```
形式2:
``` javascript
$root.waterfall(function(waterfall){
	waterfall.add('<div class="item">新增元素</div>');
});
```
两者等价。

插件公开方法有如下[其余方法，不推荐使用。下面例子，参考形式2调用]：

1、 waterfall.add(elem);  追加一个新的元素，elem 可为 string | documentElement | jquery element
2、 waterfall.add(index, elem);  往 index 位子项前，插入一新元素，index 必须是整数
3、 waterfall.remove(index);  删除index位子项
4、 waterfall.replace(index, elem); 将第 index 位子项，替换成新的 elem
5、 waterfall.reset(options);  重置插件配置，重置参数后，需调用 reflow，触发重绘
6、 waterfall.reflow();  重置所有子项的位置
7、 waterfall.resize();   当根元素宽度改变时，调用此方法，自动修正布局
8、 waterfall.wait();	阻塞操作，调用此方法后，必须等待 notify() 方法，后续操作，才会进行
9、 waterfall.notify(); 解除1次阻塞

如删除第2个子项，等删除结束后，在插入一个新的子项，到第4位:
``` javascript
// 索引从 0 开始
waterfall.remove(1).wait().add(3, '<div class="item">新子项</div>');
```
在 add,remove,replace,reflow,resize,reset 操作，都内置了 notify() 操作。
所有 wait() 方法，都必须紧跟在上述方法后面 [ 也仅在其后面，才生效 ]。

关于插入、删除等动画，相关配置方法：

1、子项插入动画
``` javascript
	waterfall.addAnimate(function($elem, next){
		// 不要执行修改宽度或高度的动画，必须调用 next
		$elem.animate({opacity: 1}, 200, next);
	});
```

2、子项删除动画
``` javascript
	waterfall.setRemoveAnimate(function($elem, next){
		// 必须调用 next，用于触发后续的元素删除
		$elem.animate({ opacity: 0 }, 200, next);
	});
```

3、重绘相关动画
``` javascript
	waterfall.setReflowAnimate(function($elem, newPosition, next){
		$elem.animate(newPosition, 200, next);
	});
```
