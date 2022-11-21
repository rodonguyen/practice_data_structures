class Node:
  def __init__(self, data=None) -> None:
    self.data = data
    self.next = None
  
  def append(self, next_node):
    self.next = next_node


class SingleLinkedList:
  def __init__(self, node=None) -> None:
    self.head = node

  def __str__(self):
    my_tuple = tuple()
    next_node = self.head.next
    my_tuple = my_tuple + (self.head.data,)
    while next_node != None:
      my_tuple = my_tuple + (next_node.data,)
      next_node = next_node.next
    return str(my_tuple)

  def remove(self, index):
    pass


n1 = Node('Mon')
n2 = Node('Tues')
n3 = Node('Wed')
n4 = Node('Thu')
n5 = Node('Fri')
llist = SingleLinkedList(n1)
n1.append(n2)
n2.append(n3)
n3.append(n4)

print(llist)