---
title:  类、数据与设计模式
tags: 随想
---

面向对象真是一个有趣的玩法。

与函数式的写法不同，在函数式中，数据是不可变的。比如我在最开始设定的数据，到达代码的最后，也不会发生任何变化。产生出来的东西只是它们做的映射。比如：

```php
$A = 1
do_someting($A)
//A 还是 1
```

但对一个类而言，它本身就代表着数据类型。而它的方法便是对这些数据的操作。

在我最近看到的一个例子里，发现这么一种有趣的操作：一个类有两个静态变量，一个变量存储着从网页上传来的 JSON。另一个变量保存着过滤的参数。

```php
clss A{
    static public $ajax = array();  
    static public $param = array();
}
```

在其它的类文件里，就可以通过这个类保存从网页上传来的参数。

```php
class B{
    function __constuct(){
        if ($this->getRequest()->isXmlHttpRequest()) {  
             Yaf_Dispatcher::getInstance()->autoRender(FALSE);  
             header("Content-type:application/json;charset=utf-8");  
             $json = file_get_contents("php://input");  
             Filter::$ajax = json_decode($json, true);
        }
    }
}
```

因为是静态变量，于是，这个 A 类的变量就获得了参数。A 类的子类也得到了这个传过来的参数。于是，我们就可以用子类做一定的过滤。满足某个条件的参数，就放进 param 里。

```php
class para_Filter extends A{
    public static do_some_filter(){
        if (isset(self::$ajax['content'])) {
            $content = self::contentValid();
            if ($banner['content'] == $content) {
                  echo "content Error";
            }
            self::$param['content'] = $content;
        }
    }

    protected static function contentValid(){
        $stringLength = mb_strlen(self::$ajax['content'],'utf8');
        if ($stringLength<1 || $stringLength >10000){
            $content = false;
        }else{
            $content = self::$ajax['content'];
        }
        if (!$content){
                echo "no content Error";
        }
        return $content;
    }
}
```

如果 B 类的子类想要数据，那么只要从 para_Filter 那么得到就可以了。下面也就是我们主函数的部分。

```php
class xx_Action extends B{
    public mian(){
        para_Filter::do_some_filter();
        $content = A::param['content'];
    }

    public otherPost(){
        para_Filter::do_other_filter();
        ...
    }
}
```

这一套下来，也就大体实现了一个过滤器。如果我要的不是传上来的的 content，想要做新的拓展，那只要再创建新的函数、新的类就可以了。我不用管参数怎么来，只要知道，传过来的东西符不符合我的标准就好了。如果我过滤的标准发生了变化，只要改变 para_Filter 里的方法就好了，其它的地方可以一概不动。

好玩的地方在于：可以看到，A 这个类没有方法，它就是一个数据的集合，一个数据结构。而它的子类，为它拓展了方法，但它们本身依然是数据结构。同时，它也随时在发生变化，而不是简单的映射。 虽然在我们的主函数里，没有对 A 这个类本身做过实例，也没有改变它的函数，但它在确确实实的产生了变化，而且还留在了它的基因里。

因此，我把类看成数据本身，也没错吧 ：)