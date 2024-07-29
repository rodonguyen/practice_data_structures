class Node:
  def __init__(self, data=None, next=None, prev=None) -> None:
    self.data = data
    self.next = next
    self.prev = prev
  
  # def append(self, next_node):
  #   self.next = next_node

  def __str__(self) -> str:
    return str(self.data)
  
  def print_all_props(self) -> str:
    return str(f'{self.prev} - {self.data} - {self.next}')
      

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

  def insert(self, node):
    # insert at the end
    node.prev = self.last_node
    self.last_node.next = node  

    self.last_node = node # for storing purpose
    self.length += 1


    if self.maximum.data < node.data:
      self.maximum = node
    if self.minimum.data > node.data:
      self.minimum = node

  def delete(self, index):
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
    
    # Search min/max again if delete one
    if self.maximum == removed_node:
      print('search max')
      self.maximum = self.search_max()
    if self.minimum == removed_node:
      print('search min')
      self.minimum = self.search_min()
 
  def search_data(self, data) -> Node: 
    node_pointer = self.head
    has_found = False
    while (not has_found):
      if (data == node_pointer.data):
        has_found = True
        return node_pointer
      elif (node_pointer.next != None):
        node_pointer = node_pointer.next
      else: return -1

  def get_successor(self):
    # Already implemented in node
    pass

  def get_predecessor(self):
    # Already implemented in node
    pass


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

## Test insert
llist.insert(n2)
llist.insert(n3)
llist.insert(n4)
llist.insert(n5)


# print('min:',llist.minimum)
# print('max:',llist.maximum)

## Test delete
# llist.delete(0)
# llist.delete(1)

print(llist)
print(llist.head.next.print_all_props())

## Test search_data
print(llist.search_data('Thu'))
print(llist.search_data('Frri'))

# print('min:',llist.minimum)
# print('max:',llist.maximum)
# print('length:', llist.length)

## Test successor/predecessor
print(n5.prev)
print(n5.next)
print(n2.prev)