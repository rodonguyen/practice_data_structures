from collections import deque, Counter, defaultdict

class Solution:
    def findRedundantConnection(self, edges):
        # UNION FIND 1
        def find(x, root):
            if root[x] == x:
                return x
            root[x] = find(root[x], root)
            return root[x]

        def union(rootX, rootY, root):
            for i in root.keys():
                if root[i] == rootY:
                    root[i] = rootX

        root = defaultdict(int)

        for x, y in edges:
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
                return [x, y]
            else:
                union(rootX, rootY, root)
