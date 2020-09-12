---
layout: post
title:  对于虚拟化的执着
categories: 随想
---

我第一次了解到虚拟化，是在用 VM Ware 时。

虚拟化给人的感觉真的很棒。将真实与实验分割开来，互不影响，即使出了问题，删掉再开就是了。在虚拟机里发生的事情，丝毫不影响主机，这种感觉真的有种玩游戏/做梦的错觉。但总觉得 VM 还是太大了，开起来之后，整个电脑都卡成 PPT 了。

后来用 Python 做一些小服务时，发现 Python3 自带虚拟化。通过

```sh
$ python3 -m venv vitual_name
```

就可以建立一个小的虚拟环境。在这个小环境里，新装的所有第三方库，都不会影响到主机现有的库。这样一来，python 依敕也就可以随便玩了。如果依敕出了问题，比如版本号不对，新的版本不兼容旧的代码等，也不至于所有的脚本都影响到。删了就好了。

再后来发现了 Docker。Docker 比起虚拟机，轻量得多。在上面建立好服务后，便可以上传。到了另一台服务器上，下载便可以使用，不用再装各种依赖，解决各种各样的麻烦。就如它的名字一样，依赖被关在 Docker 里。当需要时，打开 docker，所有的东西都在里面。这在开发时简直是利器啊！我只要在本地做好一个版本，工作就完全结束了，剩下服务器端只要下载，运行，就OK了。

同时，我也要好奇。虚拟化那麽厉害的东西，究竟是怎麽完成的？

仔细想想，虚拟化并不是什麽新奇的东西。我们的每一个进程，从某种角度上看，就是虚拟化的产物。

在早期计算机的发展中，内存是很稀缺的一种东西。比如有些电脑就 4k bytes。这种情况下，光是加载程序文本就很困难。于是虚拟内存、页表等孕育而生。它们让每一个进程觉得，自己独佔了机器，随意使用计算机里的内存。通过 CPU 调度，让每一个进程都有一定的活动时间。从人的角度上看，有多个进程在运行，而进程本身，它们只看到了自己。

从这个角度上看，每一个进程都与主机上的其它程序无关，它们彼此隔开，就好像一台台虚拟机。

不过，改变了世界的 Linux 给我们带来了更美妙的东西。

在 Linux 里，有趣的命令很多，其中的一条就和我今天想讨论的东西有关。它就是 chroot。

chroot 是一个可以欺骗命令的命令。它可以让任何命令，认爲当前的目录就是根目录。

```sh
$ chroot /path/to/new/root command
```
Linux 中，绝大部分命令、程序，都以根目录 「/」 爲中心。如果能欺骗命令，让其认定新的根目录，不就好像实现了虚拟化了吗？

比如下面这一个有趣的实验。它建立了一个只能使用 ls 命令的监狱(jali)。方法也很简单，只将跟 ls 有关的依赖放在新目录里，再 chroot bash 命令。

![建立监狱的过程](/assets/2019-08-11-dui-yu-xu-ni-hua-de-zhi-zho/1565527230467.gif)

但这并不够。chroot 只能使用在文件系统上。对于网络，IO等，它无法限制。

于是，内核 3.8 中，诞生的 namespace（命名空间）打破了这一限制。namespace 也是一种虚拟化方式，但它可以做到更多。它支持以下几种 namespace。

- uts_namespace
- ipc_namespace
- mnt_namespace
- pid_namespace
- user_namespace
- net

在进程的虚拟化上，使用 fork 或 clone 就可以创建一个新的命名空间。进程与命名空间之间，借助 nsproxy 进行代理。

从 nsproxy 的结构上，也可以看到上面的几种命名空间。

```c
struct nsproxy{
    atomic_t count;
    struct uts_namespace *uts_ns;
    struct ipc_namespace *ipc_ns;
    struct mnt_namespace *mnt_ns;
    struct pid_namespace *pid_ns;
    struct net *net_ns;
}
```

除开第一行，剩下都是命名空间的结构。

命名空间的出现，才有了如今的 docker。

对于虚拟化越发的着迷，我对计算机就越发的执着。

想来想去，之所以会着迷于虚拟化，可能是因爲从小搞坏了不少电脑的原故吧？