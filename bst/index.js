// 二叉搜索树
class BST {
  root = null

  insert(val) {
    const newNode = new TreeNode(val)
    const insertNode = node => {
      if (!node) {
        node = newNode
      } else if (val < node.val) {
        node.left = insertNode(node.left)
      } else if (val > node.val) {
        node.right = insertNode(node.right)
      }
      return node
    }

    if (this.root) {
      insertNode(this.root)
    } else {
      this.root = newNode
    }
  }

  find(val) {
    const f = node => {
      if (!node) return null
      if (val < node.val) return f(node.left)
      if (val > node.val) return f(node.right)
      return node
    }
    return f(this.root)
  }

  min(node) {
    const findMin = node => node?.left ? findMin(node.left) : node
    return findMin(node || this.root)
  }

  max(node) {
    const findMax = node => node?.right ? findMax(node.right) : node
    return findMax(node || this.root)
  }

  remove(val) {
    const removeNode = (node, x) => {
      if (!node) return null
      if (x < node.val) {
        node.left = removeNode(node.left, x)
      } else if (x > node.val) {
        node.right = removeNode(node.right, x)
      } else if (node.left && node.right) {
        const temp = this.min(node.right)
        node.val = temp.val
        node.right = removeNode(node.right, temp.val)
      } else if (!node.left) {
        node = node.right
      } else {
        node = node.left
      }
      return node
    }

    return removeNode(this.root, val)
  }
}

function TreeNode(val, left, right) {
	this.val = val === undefined ? 0 : val
	this.left = left === undefined ? null : left
	this.right = right === undefined ? null : right
}
