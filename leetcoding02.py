from math import sqrt, floor, log
from collections import defaultdict
import random
import heapq



##############################################
#          AerVision Interview               #
##############################################
class Node():
    def __init__(self, val, left=None, right=None):
        self.val = val      # int
        self.left = left    # Node
        self.right = right  # Node
        

class BinarySearchTree():
    def __init__(self, node=None):
        self.node = node
    
    def add(self, number):

        # Head does not exist
        if not self.node:
            self.node = Node(number)
            return
            
        currentNode = self.node
        while currentNode:
            # Number is on the right branch
            if number >= currentNode.val:
                if currentNode.left:
                    currentNode = currentNode.left
                else: 
                    currentNode.left = Node(number)
                    return
            # Number is on the left branch
            else:
                if currentNode.right:
                    currentNode = currentNode.right
                else:
                    currentNode.right = Node(number)
                    return


    def exist(self, number: int):
        def existInSubTree(number: int, currentNode: Node):
            # Node is None, reach end of the tree, return False
            if currentNode == None:
                return False

            if currentNode.val == number:
                return True
            
            if number >= currentNode.val:
                return existInSubTree(number, currentNode.left)
            else: 
                return existInSubTree(number, currentNode.right)

        currentNode = self.node
        return existInSubTree(number, currentNode)


    def print(self):
        def printNode(level: int, currentNode: Node):
            # Check if the currentNode has right child, process right child
            if currentNode.right:
                printNode(level+1, currentNode.right)

            # Print parent
            print('  '*level + str(currentNode.val))

            # Check if the currentNode has left child, process left child
            if currentNode.left:
                printNode(level+1, currentNode.left)
        
        if self.node:
            printNode(0, self.node)
        else: 
            return

        

######################################################

def neighbous(coordinates: list, p: tuple, radius: float):
    my_heapq = []
    count = 0
    
    for (x,y) in coordinates:
        distance = sqrt((p[0] - x)**2 + (p[1] - y)**2)

        if distance <= radius:
            count += 1
            heapq.heappush(my_heapq, (distance, (x,y)))

    result = [value for _, value in my_heapq]
    return result

coordinates = [(-5,-5), (-5,0), (0, -5), (5, 5), (5, 0), (0, 5), (-2, 0), (0, -2), (-2, -2), (1, 0), (0, 1), (1, 1)]
p = (0, 0)
radius = 0.5

print(neighbous(coordinates, p, radius))

radius = 1.5
print(neighbous(coordinates, p, radius))

radius = 2
print(neighbous(coordinates, p, radius))


    















