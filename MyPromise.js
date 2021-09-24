const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
class MyPromise {
    constructor(executor) {
        // 执行器，进入后立即执行
        try {
            executor(this.resolve,this.reject)
        } catch(error) {
            this.reject(error)
        }
    }
    // 存储状态
    status = PENDING
    // 成功后的值
    value = null
    // 失败之后的原因
    reason = null
    // 缓存成功与失败的回调函数
    onFulfilledCallbacks = []
    onRejectedCallbacks = []
    // 使用箭头函数
    // 直接调用普通函数的this指向window或者undefined
    // 箭头函数this指向当前实例
    resolve = (value) => {
        // PENDING -> FULFILLED
        if(this.status === PENDING) {
            this.value = value
            this.status = FULFILLED
            
            // 判断成功的回到是否存在，存在就执行
            while(this.onFulfilledCallbacks.length) {
                this.onFulfilledCallbacks.shift()(value)
            }
        }
    }
    // PENDING -> REJECTED
    reject= (reason) => {
        if(this.status === PENDING) {
            this.status = REJECTED
            this.reason = reason

            // 判断失败回到是否存在，存在就执行
            while(this.onRejectedCallbacks.length) {
                this.onRejectedCallbacks.shift()(reason)
            }
            this.onRejectedCallback && this.onRejectedCallback(reason)
        }
    }
    // then方法，用于添加回调函数??? 
    // 理解不聊了
    then(onFulfilled,onRejected) {
        const realOnFulfilled = typeof onFulfilled === 'function' ? onFulfilled:value=>value
        const realOnRejected = typeof onRejected === 'function' ? onRejected:reason=>{throw reason}
        // 链式调用
        const promise2 = new MyPromise((resolve,reject) => {
            const fulfilledMicrotask = ()=>{
                queueMicrotask(()=>{
                    try {
                        const x = realOnFulfilled(this.value)
                        resolvePromise(promise2,x,resolve,reject)
                    } catch(e) {
                        reject(e)
                    }
                })
            }

            const rejectedMicrotask = ()=>{
                queueMicrotask(()=>{
                    try {
                        const x = realOnRejected(this.reason)
                        resolvePromise(promise2,x,resolve,reject)
                    }catch(e) {
                        reject(e)
                    }
                })
            }

            if(this.status === FULFILLED) {
                fulfilledMicrotask()
            } else if(this.status === REJECTED) {
                rejectedMicrotask()
            } else if(this.status === PENDING) {
                this.onFulfilledCallbacks.push(fulfilledMicrotask)
                this.onRejectedCallbacks.push(rejectedMicrotask)
            }
        })
        return promise2
    } 

    static resolve(parameter) {
        if(parameter instanceof MyPromise) {
            return parameter
        }
        // 转为常规的Promise
        return new MyPromise(resolve=>{
            resolve(parameter)
        })
    }

    // 转为常规的
    static reject(reason) {
        return new MyPromise((resolve,reject)=>{
            reject(reason)
        })
    }
}
MyPromise.deferred = function() {
    var result = []
    result.promise = new MyPromise(function(resolve,reject){
        result.resolve = resolve
        result.reject = reject
    })
    return result
}
// ？？？
// MyPromise.js
// resolvePromise这个方法应该解决的是链式调用的“值穿透”问题吧
function resolvePromise(promise, x, resolve, reject) {
    // 如果相等了，说明return的是自己，抛出类型错误并返回
    if (promise === x) {
      return reject(new TypeError('The promise and the return value are the same'));
    }
  
    if (typeof x === 'object' || typeof x === 'function') {
      // x 为 null 直接返回，走后面的逻辑会报错
      if (x === null) {
        return resolve(x);
      }
  
      let then;
      try {
        // 把 x.then 赋值给 then 
        then = x.then;
      } catch (error) {
        // 如果取 x.then 的值时抛出错误 error ，则以 error 为据因拒绝 promise
        return reject(error);
      }
  
      // 如果 then 是函数
      if (typeof then === 'function') {
        let called = false;
        try {
          then.call(
            x, // this 指向 x
            // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
            y => {
              // 如果 resolvePromise 和 rejectPromise 均被调用，
              // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
              // 实现这条需要前面加一个变量 called
              if (called) return;
              called = true;
              resolvePromise(promise, y, resolve, reject);
            },
            // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
            r => {
              if (called) return;
              called = true;
              reject(r);
            });
        } catch (error) {
          // 如果调用 then 方法抛出了异常 error：
          // 如果 resolvePromise 或 rejectPromise 已经被调用，直接返回
          if (called) return;
  
          // 否则以 error 为据因拒绝 promise
          reject(error);
        }
      } else {
        // 如果 then 不是函数，以 x 为参数执行 promise
        resolve(x);
      }
    } else {
      // 如果 x 不为对象或者函数，以 x 为参数执行 promise
      resolve(x);
    }
  }
  
// 对外暴露
module.exports = MyPromise