a = [1,2,3,4,5,6,7,8,9,10,10,11,11,11,11,11,12,13,14]
a = [1,2,3,4]

def binary_search_last(an_array, key, low, high):
  mid = int((low + high) /2)
  print(low, mid, high)

  if (low > high): return high  # top boundary

  if (an_array[mid] > key): # prioritise search to the right half
    return binary_search_last(an_array, key, low, mid-1)
  else:
    return binary_search_last(an_array, key, mid+1, high)


def binary_search_first(an_array, key, low, high):
  mid = int((low + high) /2)
  print(low, mid, high)

  if (low > high): return low  # low boundary

  if (an_array[mid] < key):  # prioritise search to the left half
    return binary_search_first(an_array, key, mid+1, high) 
  else:
    return binary_search_first(an_array, key, low, mid-1)

key = 3
print(len(a))
print(binary_search_last(a, key, 0, len(a)-1))
print(binary_search_first(a, key, 0, len(a)-1))
