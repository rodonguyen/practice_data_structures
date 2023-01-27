import math


def rob(nums) -> int:
        curr, prev1, prev2 = 0, 0, 0
        for i in nums:
            curr = max(i + prev2, prev1)
            prev1, prev2 = curr, prev1
            print(curr, prev1, prev2)

        return curr


# nums = [2,7,9,3,1]
# print(rob(nums), 12)
# nums = [2,7,9,3,1,0]
# print(rob(nums), 12)
# nums = [1,2,3,1]
# print(rob(nums), 4)
# nums = [11]
# print(rob(nums), 11)
# nums = [3,1,1,3,3,2]
# print(rob(nums), 8)
# nums = [3,1,1,3]
# print(rob(nums), 6)
# nums = [1,3,10,1,1,3]
# print(rob(nums), 14)

print('123456'[1::-1])