from collections import deque, Counter, defaultdict
import collections
import heapq



def find(x, root):
   return root[x]

def union(rootX, rootY, root):
        for i in root.keys():
            if root[i] == rootY:
               root[i] = rootX

def findRedundantConnection( edges) :
        root = defaultdict(int)
        
        for x,y in edges:
            rootX = find(x, root)
            rootY = find(y, root)
            if rootX == 0 and rootY == 0:
                root[x] = x
                root[y] = x
            elif rootX == 0:
                root[x] = rootY
            elif rootY == 0:
                root[y] = rootX
            elif rootX == rootY:
                return [x,y]
            else:
                union(rootX, rootY, root)
                
            print(root)

print(findRedundantConnection([[20,24],[3,17],[17,20],[8,15],[14,17],[6,17],[6,24],[13,19],[15,18],[1,9],[4,9],[4,19],[5,10],[4,21],[4,12],[5,6]]))

# print(findRedundantConnection([[1,4],[3,4],[1,3],[1,2],[4,5]]))
