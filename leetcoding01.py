from collections import deque, Counter, defaultdict
import collections
import heapq
import math
import bisect

def minArea(x,y,k):
    length = len(x)
    mini = [math.inf]

    def dfs2(size, start_index, minx, maxx, miny, maxy):
        nonlocal mini
        if size == k:
            max_side = max(abs(maxx-minx), abs(maxy-miny))
            print(max_side)
            mini[0] = min(max_side, mini[0]) 
            return
        
        # for i in range(start_index, min(length, (length-k+1)+start_index)): # Same effect
        for i in range(start_index, (length-k+1)+size):  
            dfs2(size+1, i+1, min(minx, x[i]), max(maxx, x[i]), min(miny, y[i]), max(maxy, y[i]))

    dfs2(0, 0, math.inf, -math.inf, math.inf, -math.inf)
    return (mini[0]+2)**2


x = [-4,3,1]
y = [3,3,-1]
print(minArea(x,y,2), ' - ans should be 36')


x = [-4,3,1]
y = [3,3,-1]
print(minArea(x,y,3), ' - ans should be 81')

x = [-4,3,3]
y = [3,3,2]
print(minArea(x,y,2), ' - ans should be 9')

x = [1,2,3,4,5,6,7,8,9]
y = [3,3,3,3,3,3,3,3,3]
print(minArea(x,y,9), ' - ans should be 100')