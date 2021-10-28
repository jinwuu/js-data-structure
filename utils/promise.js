const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class Promise {
  status = PENDING
  value = null
  reason = null
  onFulfilled = []
  onRejected = []

  constructor(executor) {
    const resolve = value => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        this.onFulfilled.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejected.forEach(fn => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }

    const promise2 = new Promise((resolve, reject) => {
      const resolvePromise = x => {
        if (x === promise2) return reject(new TypeError('Chaining cycle'))

        if (x && typeof x === 'object' || typeof x === 'function') {
          let used = false
          const helperFunc = cb => {
            if (used) return
            used = true
            cb()
          }
          try {
            const { then } = x
            if (typeof then === 'function') {
              then.call(
                x,
                y => helperFunc(() => resolvePromise(y)),
                e => helperFunc(() => reject(e))
              )
            } else {
              helperFunc(() => resolve(x))
            }
          } catch (e) {
            helperFunc(() => reject(e))
          }
        } else {
          resolve(x)
        }
      }
      const handleFulfilled = () => {
        queueMicrotask(() => {
          try {
            resolvePromise(onFulfilled(this.value))
          } catch (e) {
            reject(e)
          }
        })
      }
      const handleRejected = () => {
        queueMicrotask(() => {
          try {
            resolvePromise(onRejected(this.reason))
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.status === FULFILLED) {
        handleFulfilled()
      } else if (this.status === REJECTED) {
        handleRejected()
      } else {
        this.onFulfilled.push(handleFulfilled)
        this.onRejected.push(handleRejected)
      }
    })
    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(cb) {
    return this.then(
      val => Promise.resolve(cb()).then(() => val),
      e => Promise.resolve(cb()).then(() => { throw e }),
    )
  }

  static resolve(param) {
    if (param instanceof Promise) return param
    return new Promise((resolve, reject) => {
      if (param?.then && typeof param.then === 'function') {
        queueMicrotask(() => param.then(resolve, reject))
      } else {
        resolve(param)
      }
    })
  }

  static reject(reason) {
    return new Promise((resolve, reject) => reject(reason))
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      if (!promises.length) return []
      let index = 0
      const res = []
      const handleVal = (i, val) => {
        res[i] = val
        ++index === promises.length && resolve(res)
      }
      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(
          val => handleVal(i, val),
          e => reject(e)
        )
      }
    })
  }

  static allSettled(promises) {
    return new Promise((resolve, reject) => {
      if (!promises.length) return []
      let index = 0
      const res = []
      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(
          value => {
            res[i] = { status: FULFILLED, value }
            ++index === promises.length && resolve(res)
          },
          reason => {
            res[i] = { status: REJECTED, reason }
            ++index === promises.length && resolve(res)
          }
        )

      }
    })
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      if (!promises.length) return
      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(
          val => resolve(val),
          e => reject(e),
        )
      }
    })
  }

  static defer() {
    const d = {}
    d.promise = new Promise((resolve, reject) => {
      d.resolve = resolve
      d.reject = reject
    })
    return d
  }

  static deferred() {
    return Promise.defer()
  }
}

module.exports = Promise
