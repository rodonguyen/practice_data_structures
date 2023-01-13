def isSubsequence(s: str, t: str) -> bool:
    t = iter(t)
    for c in s:
      print('====')
      print(c)
      print(c == t)
      print(c in t)



print(isSubsequence('abc', 'adfbeec'))