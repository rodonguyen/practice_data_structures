from collections import Counter, defaultdict


def groupAnagrams(strs: list[str]) -> list[list[str]]:
    r = {}
    for i in strs:
        a = "".join(sorted(i))
        if a not in r.keys():
            r[a] = [i]
        else:
            r[a].append(i)
    return r.values()


print(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
