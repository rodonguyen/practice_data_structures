def smallestEquivalentString(s1: str, s2: str, baseStr: str) -> str:
    # 97 = ord('a')

    def dfs(char, minOfGroup, visited):
        if char in minOfGroup:
            return minOfGroup[char]
        if char == 0:
            return 0

        min = char
        for i in range(0, 26):
            if matrix[char][i] == 1 and i not in visited:  
                visited.append(i)
                minCurrent = dfs(i, minOfGroup, visited)
                if minCurrent < min: 
                    min = minCurrent

        return min


    matrix = [[0]*26 for _ in range(26) ]
    # print(matrix)

    for i in range(len(s1)):
        index1 = ord(s1[i]) - 97
        index2 = ord(s2[i]) - 97
        matrix[index1][index2] = 1
        matrix[index2][index1] = 1
    print(matrix[0])
    
    minOfGroup = {}
    newBaseStr = ''
    for char in baseStr:
        minChar = dfs(ord(char)-97, minOfGroup, [])
        minOfGroup[ord(char)-97] = minChar 
        print(char, '=>', chr(minChar+97))
        newBaseStr += chr(minChar+97)

    print(minOfGroup)

    return newBaseStr


# print(smallestEquivalentString("cgokcgerolkgksgbhgmaaealacnsshofjinidiigbjerdnkolc", "rjjlkbmnprkslilqmbnlasardrossiogrcboomrbcmgmglsrsj", "axawaaaaazaaaaaaaaaaaaaxaaaaawaaauxaaauaaayzaauaaa"))
print(smallestEquivalentString("leetcode", "programs", "sourcecode"))