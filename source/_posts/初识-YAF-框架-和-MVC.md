---
title: 初识 YAF 框架 和 MVC
date: 2019-07-14
tags:php 学习
---
这是我第一次使用 PHP 做开发。

因为 PHP 的名声不够好，加之开发环境不是很方便（至少要懂得 WEB 相关的东西，才能开始学习）。于是也没怎么关注。但是现在有任务用到 YAF 框架，基于 PHP 做开发，也得懂一点东西了。

至于为什么写这个，主要还是因为官方文档太不友好了。初学者上去看，只会先被复杂烦锁的配制文件难住，然后找不到方向，最后迷失在安装框架和配制上。有这点时间，用 python 怕是已经搞定一个网站了。于是我想，给想要尝试用 yaf 入门网页开发的新人，做点小工作，我说的不全，但会帮助你理解一个网站的大概设计。当然我也不保证自己写的东西能让人看懂就是了。

首先，YAF 的框架结构树如下。

```
+ public 
  |- index.php // 入口文件 
  |- .htaccess // 重写规则 
  |+ css 
  |+ img 
  |+ js 
+ conf 
  |- application.ini // 配置文件 
+ application 
  |+ controllers 
    |- Index.php // 默认控制器 
  |+ views 
      |+ index // 默认视图目录 
        |- index.phtml // 默认视图 
  |+ modules // 其他模块 
  |+ library // 本地类库 
  |+ models // model目录 
  |+ plugins // 插件目录
```

注意，前面有 + 号代表目录，- 号代表文件。让我们先把焦点放在 application 这个目录上。
application

这个目录算是最主要的文件目录了。模型（Model）、控制器（Control）还有视图（View）都放在这里。

模型（Model），如果用更常见的说法，它可能与对象更加接近。我个人无法完全描述这个东西。但我们得知道一样，数据是计算机中最重要的东西，而 Model 就是描述数据的东西。

所谓的控制器（Control），就是网页的行为。比如，我们的其它函数从数据库里得到数据，通过控制器，将数据交给网页，让其渲染。又比如，网页表单提交上来时，要有一个函数接收数据，并存到数据库上，或者做其它操作。有时，这种函数也就做 API 接口。它连接着 模型 和 视图，作为中间的状态。

再之，是视图（View），也就是我们的 HTML 页面。

将一个项目分成上面三部分是有必要的，当然，可以不分，但这不利于合作。分开之后，我们负责页面的，只管页面就好了，它需要数据就去向 控制器 取，而 模型 也不用管页面，它做它的事，控制器会帮忙传数据。这样，一个项目就可以分给三部分人处理。

回到 YAF 框架上。 YAF 框架完全遵循着 MVC 原则做的设计。

再看上面 YAF 框架的其中三个目录。

```
+ application 
  |+ controllers
    |- Index.php // 默认控制器 
  |+ views 
    |+ index // 控制器 
      |- index.phtml // 默认视图
  |+ models // model目录 
```

这个框架就包含了上面提到的 MVC 三个组成部分。当然，了解完上面的东西还不够。我们先来考虑一下几个简单的小问题。

第一，用户要怎么访问我们的网页？假设我们的网页写好了，用户要在浏览器里输入什么，才能访问到？

第二，我们要怎么区分不同的页面？一个网站不可能只有一个网页，每个网页做的事情不同，用户不可能只停留在一个网页上。登录的页面、个人主页和好友页面，显然不是同一个东西，那么怎么区分它们，让我们输入不同的地址进入不同的页面？

第三，我们要怎么把数据传到网页上？比如，当你登录之后，右上角会显示你的名字，名字很明显是从数据库里传来，传到控制器，然后传到页面，这中间是怎么操作的？

第四，我们要怎么保存用户的状态？如果之前不了解 HTTP 协议，现在大概说一下，HTTP 协议是不会保存的。也就是说，在没有做过其它工作的情况下，你换到另一个页面，那一个页面是不知道你在这个页面做个什么，就算同一个页面，一刷新，它也不知道你做过什么。如果你在这个页面登录了，切到下一个页面，一切都消失了，那就很糟糕。那么该怎么做才能保留信息？

篇符有限，先讨论前三个问题，后面一个问题下一篇文章再讨论。

先前有说过，controllers 连接着 views 和 models。现在，先关注 controllers 和 views 的关系。

```
+ application 
  |+ controllers
    |- Index.php // 默认控制器 
  |+ views 
    |+ index // 默认视图目录
      |- index.phtml // 默认视图
```

还是这个目录。可以发现，默认情况下，controllers 里的文件 Index.php 和 views 下的目录 index 字母是一样的。在这种情况下，Index 这个控制器就和 index 目录连在了一起。 控制器 Index.php 的代码如下:

```php
<?php
class IndexController extends Yaf_Controller_Abstract
{
    /**
     * 默认 Action
     */
    public function indexAction()
    {
        $this->getView()->assign("content", "Hello World");
    }
 }

index.phtml 代码如下：

<html>  
<head>  
    <title>Hello World</title>  
</head>  
<body>  
    <?php echo $content;?>  
</body>  
</html>
```

类里只有一个函数，indexAction 这是 yaf 的默认命名方式。index 对应着视图 index.phtml。这样，当我们访问 http://域名/项目名/index/index 时，就能看到 index.phtml 里的东西了。同理，有这么一个目录：

```
+ application 
  |+ controllers
    |- Index.php // 默认控制器 
    |- Login.php // 新的控制器 

  |+ views 
    |+ index // 默认视图目录
      |- index.phtml // 默认视图
    |+ login // 新的视图目录
      |- index.phtml // 新的视图
```

那么访问 http://域名/项目名/login/index 就能访问到新的视图。

如果这个新的图里，还有另一个页面。finished.phtml

```
+ application 
  |+ controllers
    |- Index.php // 默认控制器 
    |- Login.php // 新的控制器 

  |+ views 
    |+ index // 默认视图目录
      |- index.phtml // 默认视图
    |+ login // 新的视图目录
      |- index.phtml // 新的视图
      |- finished.phtml // 新的视图
```

那么只要在 Login.php 里加一个新函数

```php
<?php  
  
class LoginController extends AbstractController  
{  indexAction()  
 {
   
  $this->getView()->assign("content", "Hello Login");  
  
 }  public function indexAction()  
 { 
 
  $this->getView()->assign("content", "Finishied!");  
  
 }}
```

那么再访问 http://域名/项目名/login/finished 就能访问到新的视图。

就这么简单。函数里那一条唯一的代码，就是设定 一个名为 content 的变量，其值为 后面的字符串，并把它传到 phtml 上，再由 PHP 渲染。

前三个问题就解决完了！
