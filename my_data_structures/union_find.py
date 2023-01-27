def find( x, root):
   return root[x]

def union(x, y, root):
   rootX = find(x, root)
   rootY = find(y, root)
   if rootX != rootY:
      for i in range(len(root)):
            if root[i] == rootY:
               root[i] = rootX