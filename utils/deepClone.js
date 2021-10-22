function deepClone(obj, hash = new WeakMap()) {
  if (obj instanceof RegExp) return new RegExp(obj)
  if (obj instanceof Date) return new Date(obj)
  if (obj === null || typeof obj !== 'object') return obj
  if (hash.has(obj)) return hash.get(obj)

  const t = new obj.constructor()
  hash.set(obj, t)
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      t[key] = deepClone(obj[key], hash)
    }
  }
  return t
}
