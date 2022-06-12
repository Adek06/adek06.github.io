---
title: jwt 的两种签名方式
tags: 随想
---

打开 jwt.io 时，发现 jwt.io 中一共提供了 4 种签名算法

![Untitled](/assets/2022-06-12-jwt-de-liang-zhong-jian-ming-fang-shi/Untitled.png)

可实际中，我们最常用的，一般也就前两种, HS 和 RS

HS 开头的算法，表示是用 HMAC 算法进行签名，SHA 算法进行哈希，比如 HS-256 就是 HMAC with SHA-256。RS 开头的，表示用 RSA 进行签名，用 SHA 进行哈希，比如 RS-256 就是 RSA Signature with SHA-256。

一般我们在使用 JWT 时，会最先解触的是 HS256，我们在打开 jwt.io 时，默认提供的也是这个。我们就先用这个入手，来讲讲 jwt 是什么，以及为什么我们会使用 RS256

## HS-256

![Untitled](/assets/2022-06-12-jwt-de-liang-zhong-jian-ming-fang-shi/Untitled2.png)

JWT 的样子就像图中左边的部分。通过颜色红紫蓝，我们可以看到它可以分成 3 部分，这 3 部分分别对应图右边的 3 部分 header, payload, signature。

- header 部分存有 jwt 的生成算法，我们在得到 jwt token 之后，可以解析出来，这个 token 用的是什么算法，以来决定我们将使用什么算法来验证 jwt 是否合法
- payload 部分存有我们要传输的数据。这里可以定义任意结构，但因为这部分是公开的，所以不建议存放任何隐私的数据
- 通过代码，我们可以任意转换这两部分，其中，header 和 payload 部分我们可以通过 base64 转换，但 signature 会复杂一些
- signature 部分是将 header 和 payload 用 '.' 拼接起来后，通过 HMAC 算法配合密钥进行加密后，再通过 base64 进行转换

在理解了它的结构后，我们再来看看它是怎么进行生产和消费的

### 生产者的代码如下

```tsx
import { createHmac } from 'node:crypto';

const header = {
    "alg": "HS256",
    "typ": "JWT"
}
const payload = {
    "name": "John Doe"
}

const secret = 'secret';

function base64UrlEncode(obj: any) {
    return Buffer.from(JSON.stringify(obj)).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function generateToken(header: any, payload: any, secret: string) {
    let headerContent = base64UrlEncode(header); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    let payloadContent = base64UrlEncode(payload); // eyJuYW1lIjoiSm9obiBEb2UifQ

    // HMACSHA256 jwt
    let signature = createHmac('sha256', secret)
        .update(headerContent + '.' + payloadContent)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds
    return headerContent + '.' + payloadContent + '.' + signature;
}

const token = generateToken(header, payload, secret);
console.log(token)
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds
```

正如上文所说，我们会先对 header 和 payload 进行 base64 编码，之后再用 hmac 算法和 secret 进行签名，而 jwt 就是这 3 部分用点连接起来的结果。那我们是怎么验证这

### 消费者的代码如下

```tsx
import { createHmac } from 'node:crypto';

function validToken(token: string, secret: string): boolean {
    let parts = token.split('.');
    if (parts.length !== 3) {
        return false
    }
    let header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    let payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    let signature = parts[2];
    let checkSignature = createHmac('sha256', secret)
        .update(parts[0] + '.' + parts[1])
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    console.log(header) // { alg: 'HS256', typ: 'JWT' }
    console.log(payload) // { name: 'John Doe' }
    console.log(checkSignature) // xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds
    if (signature !== checkSignature) {
        return false
    }
    return true;
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds"
const secret = 'secret';

const isTrue = validToken(token, secret)
console.log(isTrue)
```

关于 header 和 payload, 我们可以直接通过 base64 decode 回来，不需要 secret。因为我们无法解密 signature，因此只能通过 secret 重做一次签名，通过自己计算的结果和 token 里携带的签名作比较，来验证 token 是否合法。

为什么要验证合法性？因为 header 部分和 payload 部分是完全公开透明，任何人只要会使用 base64 那就可以读到其中的数据，同时也就意味着他可以篡改其中的任何数据。因为消费者需要通过签名来判断它们。只要没有 secret，任何人都没法签名出相同的 signature

从上面的两段代码来看，jwt 是有很多风险的。

- 从生产者的代码来看
    - 整段代码中，攻击者唯一未明的，只有 secret，其它都是唯一确定的。我们知道 y 和确定的函数，想要知道 x 要怎么办呢？暴力破解就好了
    - 为此，我们就需要经常替换 secret，那么运维的成本就得上来了
- 从消费者的代码看
    - 因为生产者和消费者需要同时持有 secret，那就意味着，消费者一旦被攻破，整个系统就透明了。

由于上面的风险看，我们就需要更安全的生产和消费方式，RS-256 就因此诞生

## RS-256

RS-256 主要目的是为改善 HS-256 的问题

- 首先，RSA 被暴力的难度比 HMAC 大得多
- 其此，生产者和消费者的能力可以隔开。生产者无法消费 token，消费者也无法生产 token
- 分发公钥比分发 secret 更容易

### 生产者

```tsx
import { createSign } from 'node:crypto';
import * as fs from 'fs';

const payload = {
    "name": "John Doe"
}

function generateRSToken(payload: any, pri_pem_path: string) {
    const header = {
        "alg": "RS256",
        "typ": "JWT"
    }
    // use RS-256 generat jwt token
    let headerContent = base64UrlEncode(header);
    let payloadContent = base64UrlEncode(payload);
    let pri_pem = fs.readFileSync(pri_pem_path);
    let signature = createSign('RSA-SHA256').update(headerContent + '.' + payloadContent).sign(pri_pem, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return headerContent + '.' + payloadContent + '.' + signature;
}

const token = generateRSToken(payload, "./private.pem");
console.log(token)
// eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.RRAoVSHi7Cp8G_AeHEv3VUS-Xib76LjdXB5BW7Pi53xNpmlOchx75Khik0txQqGff2qk9VaUFNRHDr3DQ9u_-Utyb-NAgXWn47S-lYXmCuHXIXcOa5MDhbsTBz_GtuOLt9nHmpQ6UqUVLx-rbx5gnUkc97SZCyBclPYOypPVFijk0sqNqDLZ7fVvQJ27L9sc6mxaV0HI8ahCN2D6RbtkNoS3v4XuOWS33KfSCyTZUhGCqOdGQCX3BBnxODTinEfbQwy78ISkYdxSH8AH89fSzHH3L8EVc1L1bXNK8j7o4afjNzVEs2gsSZSy4PcyzaHkD3hxQOJO562EmQvhgXj7mg
```

### 消费者

```tsx
import { createVerify } from 'node:crypto';
import * as fs from 'fs';

function validRSToken(token: string, pub_pem_path: string) {
    let parts = token.split('.');
    if (parts.length !== 3) {
        return false
    }
    let header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    let payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    let signature = parts[2];
    let pub_pem = fs.readFileSync(pub_pem_path);
    let checkSignature = createVerify('RSA-SHA256').update(parts[0] + '.' + parts[1]).verify(pub_pem, signature, 'base64');
    if (!checkSignature) {
        return false
    }
    return true;
}
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.RRAoVSHi7Cp8G_AeHEv3VUS-Xib76LjdXB5BW7Pi53xNpmlOchx75Khik0txQqGff2qk9VaUFNRHDr3DQ9u_-Utyb-NAgXWn47S-lYXmCuHXIXcOa5MDhbsTBz_GtuOLt9nHmpQ6UqUVLx-rbx5gnUkc97SZCyBclPYOypPVFijk0sqNqDLZ7fVvQJ27L9sc6mxaV0HI8ahCN2D6RbtkNoS3v4XuOWS33KfSCyTZUhGCqOdGQCX3BBnxODTinEfbQwy78ISkYdxSH8AH89fSzHH3L8EVc1L1bXNK8j7o4afjNzVEs2gsSZSy4PcyzaHkD3hxQOJO562EmQvhgXj7mg"
const bool = validRSToken(token, "./public.pem");
console.log(bool);
```

因为生产者和消费者持有的密钥文件不同，攻击者即便拿到了公钥也没有任何意义，公钥本身就是公开的。

在更换密钥对时，消费者只需要到指定服务获取公钥就行

后面有时间再来记录另外两个算法