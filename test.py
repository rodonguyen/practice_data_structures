from collections import Counter, defaultdict


def topKFrequent(nums, k):
    freq = {}
    for i in nums:
        freq[i] = 1 + freq.get(i, 0)

    # put num into its frequency bucket
    bucket = [[] for _ in range(len(nums) + 1)]
    for k, v in freq.items():
        bucket[v].append(k)

    res = []
    for i in range(len(bucket) - 1, -1, -1):
        if bucket[i]:
            res.extend(bucket[i])
            if len(res) >= k:
                return res
    return res


# print(topKFrequent([1, 2], 2))
print(topKFrequent([1, 1, 1, 2, 2, 3], 2))
