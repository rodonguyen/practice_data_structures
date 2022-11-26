class Node:
  def __init__(self, data=None) -> None:
    self.data = data
    self.next = None
  
  # def append(self, next_node):
  #   self.next = next_node

  def __str__(self) -> str:
    return str(self.data)

class SingleLinkedList:
  def __init__(self, node) -> None:
    self.head = node
    self.last_node = node
    self.length = 1
    self.minimum = node
    self.maximum = node

  def __iter__(self):
    current = self.head
    while current:
      yield current
      current = current.next

  def __str__(self):
    return str([str(node) for node in self])

  def append(self, node):
    self.last_node.next = node
    self.last_node = node
    self.length += 1

    if self.maximum.data < node.data:
      self.maximum = node
    if self.minimum.data > node.data:
      self.minimum = node

  def remove(self, index):
    '''
    index: index of the node to remove, starting from 0
    '''
    if (index == 0):
      removed_node = self.head
      self.head = self.head.next
    elif (1 <= index < self.length):
      count = 0
      pre_node = self.head
      while count != (index -1):
        count += 1
        pre_node = pre_node.next
      removed_node = pre_node.next
      pre_node.next = pre_node.next.next  

    self.length -= 1
    
    # print(pre_node.data, pre_node.next.data)  ###
    if self.maximum == removed_node:
      print('search max')
      self.maximum = self.search_max()
    if self.minimum == removed_node:
      print('search min')
      self.minimum = self.search_min()

  def search_min(self):
    a_node = self.head
    min_node = self.head

    while a_node != None:
      print(a_node.data)
      if min_node.data > a_node.data and a_node.data != None:
        min_node = a_node
      a_node = a_node.next
    
    return min_node

  def search_max(self):
    a_node = self.head
    max_node = self.head

    while a_node != None:
      if max_node.data < a_node.data and a_node.data != None:
        max_node = a_node
      a_node = a_node.next

    return max_node

n1 = Node('Mon')
n2 = Node('Tues')
n3 = Node('Wed')
n4 = Node('Thu')
n5 = Node('Fri')

llist = SingleLinkedList(n1)
llist.append(n2)
llist.append(n3)
llist.append(n4)
llist.append(n5)


print('min:',llist.minimum)
print('max:',llist.maximum)

# llist.remove(2)
llist.remove(0)
llist.remove(3)

print(llist)
print('min:',llist.minimum)
print('max:',llist.maximum)