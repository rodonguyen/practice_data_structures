def groupAnagrams1(strs):

    d = {}
    for item in strs:
        sortedstr = tuple(sorted(item))
        if sortedstr not in d:
            d[sortedstr] = [item]
        else: 
            d[sortedstr].append(item)

    ans = []
    for key in d:
        ans.append(d[key])

    return ans

def groupAnagrams2(strs):

    d = {}
    for item in strs:
        sortedstr = tuple(sorted(item))
        if sortedstr not in d:
            d[sortedstr] = [item]
        else: 
            d[sortedstr].append(item)

    return d.keys()

import time
def run10000(strs, func1, func2):
    time1 = 0
    time2 = 0

    for _ in range(100):
        start = time.perf_counter()
        for _ in range(10000):
            func1(strs)
        time1 += time.perf_counter() - start

        start = time.perf_counter()
        for _ in range(10000):
            func2(strs)
        time2 += time.perf_counter() - start

    print('Runtime func1: ', time1)
    print('Runtime func2: ', time2)

run10000(["eat","tea","tan","ate","nat","bat"], groupAnagrams1, groupAnagrams2)
