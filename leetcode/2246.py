def longestPath( parent, s: str) -> int:
    treeDict = {}       # parent: list of its children nodes' indexes

    for i in range(len(parent)):
        if parent[i] in treeDict:
            treeDict[parent[i]].append(i)
        else: 
            treeDict[parent[i]] = [i]

    ans = 1

    def dfs(parentNode):
        nonlocal ans
        firstLongest = 0
        secondLongest = 0

        # parent_node is actually a leaf
        if parentNode not in treeDict:
            return 1
        
        for childNode in treeDict[parentNode]:
            # Update firstLongest and secondLongest if chars are different between parent and current childNode
            childLongest = dfs(childNode)   
            if s[childNode] != s[parentNode]:
                if childLongest > firstLongest:
                    secondLongest = firstLongest
                    firstLongest = childLongest
                elif childLongest > secondLongest:
                    secondLongest = childLongest

        # Include child
        ans = max(firstLongest+secondLongest+1, childLongest, ans) 

        return firstLongest+1  # For calculation in parentNode's parent. The above statement is for final answer. These are 2 separate tasks.
    

    dfs(0)
    return ans

parent = [-1,0,1,2,1]
s = "aabcb"
longestPath(parent, s)