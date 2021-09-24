# eventloop-basic

## Promise API梳理
#### 对象属性
- state
  - pending
  - fulfilled
  - rejected
- value
  - 默认undefined

#### Promise 方法
- catch
- finally
- then
<br />
- all
- allSettled
- race
- reject
- resolve
- any

```js
let promise = new Promise( (resolve,reject)=>{
    console.log('Hi Promise!')
    resolve()
})
```
```js
const getJSON = function(url) {
    const promise = new Promise((resolve,reject)=>{
        const handler = function() {
            if(this.readyState !== 4) {
                return;
            }
            if(this.status === 200) {
                resolve(this.response)
            } else {
                reject(new Error(this.statusText))
            }
        }// end_of_handler
        const client = new XMLHttpRequest();
        client.open("GET",url)
        client.onreadystatechange = handler;
        client.resposneType = 'json'
        client.setRequestHeader("Accept","application/json")
        client.send();
    })
    return promise
}
```
### 宏任务和微任务
宏任务由宿主（浏览器，node,deno）环境发起
微任务由：JavaScript自身发起
宏任务： setTimout setInterval MessageChannel I/O，事件队列 setImmediat script
微任务： requestAnimationFrame MutationObserver Promise.[then,catch,finally] process.nextTick queueMircrotask
执行顺序： 同步代码 > 微任务队列 > 宏任务队列