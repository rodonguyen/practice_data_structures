class Node():
  def __init__(self, data=None):
    self.data = data
    # self.parent = None
    self.left = None
    self.right = None

  def __str__(self) -> str:
    return(str(self.data))

  def insert(self, data):
    if self.data == None:
      self.data = data
    if data == self.data:
      raise Exception(f'data = {data} already exists in this Tree!')
    if data < self.data:
      if self.left == None:
        self.left = Node(data)
        return
      self.left.insert(data)
    elif data > self.data:
      if self.right == None:
        self.right = Node(data)
        return
      self.right.insert(data)

  def print_tree(self):
    if self.left:
      self.left.print_tree()
    print(str(self.data))
    if self.right:
      self.right.print_tree()


  def search(self, data, root):
    if root == None: return -1
    if root.data == data: return root
    if data < root.data: return root.search(data=data, root=root.left)
    if data > root.data: return root.search(data=data, root=root.right)


  def inorder_traversal(self, root):
    result = []
    if root:
      result = result + self.inorder_traversal(root.left)
      result.append(root.data)
      result = result + self.inorder_traversal(root.right)
    return result

  def delete(self, data, root):
    if root == None:
      return root

    if data == root.data:
      if root.left == None:
        root = root.right
      elif root.right == None:
        root = root.left
      else:
        # deletion of nodes with 2 children
        # find the inorder successor and replace the current node
        root.data = root.right.minimum().data
        root.right = self.delete(root.data, root.right)
    elif data < root.data:
      root.left = self.delete( data, root.left)
    else:
      root.right = self.delete( data, root.right)
    return root

  def maximum(self):
    max = self.left
    while (max.left != None):
      max = max.left
    return max

  def minimum(self):
    min = self.left
    while (min.left != None):
      min = min.left
    return min


n1 = Node(11)

n1.insert(82)
n1.insert(2)
n1.insert(13)
n1.insert(14)
# n1.insert(14)


# print(n1.inorder_traversal(n1))
# print(n1.search(11, n1))
# print(n1.search(14, n1))


n1.delete(82, n1)
n1.print_tree()
print()
print()
print()
print()