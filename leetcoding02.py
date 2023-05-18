from math import sqrt, floor, log
from collections import defaultdict


def minCost(red, blue, blueCost):
    ans = [0]

    mi = 0
    isOnBlue = False

    for i in range(len(red)):
        if isOnBlue: cBlueCost = 0
        else: cBlueCost = blueCost

        cRed = mi + red[i]
        cBlue = mi + blue[i] + cBlueCost

        if cBlue <= cRed: 
            isOnBlue = True
            mi = cBlue
        else:
            mi = cRed

        ans.append(mi)




    print(ans)

# minCost([2,3,4], [2,1,1], 2)
minCost([40,20], [30,25], 5)
