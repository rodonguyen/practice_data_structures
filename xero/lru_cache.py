# Implement a LRU cache - Leetcode
# get
# put

from typing import Dict


class Node:
    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    _rightNode: Node = Node(0, 0)  # Just recent used
    _leftNode: Node = Node(0, 0)  # Last recent used
    _cache: Dict[int, Node] = {}

    def __init__(self, capacity: int):
        self._capacity = capacity
        self._rightNode.prev = self._leftNode
        self._leftNode.next = self._rightNode

    def get(self, key: int) -> int:
        if key not in self._cache:
            return -1

        # Move the node to the right of the cache
        self._remove(self._cache[key])
        self._insert(self._cache[key])

        return self._cache[key].value

    def put(self, key: int, value: int) -> None:
        if key in self._cache:
            # Update the value of the node
            self._cache[key].value = value
            self._remove(self._cache[key])
            self._insert(self._cache[key])
            return
        elif key not in self._cache:
            # Create a new node
            self._cache[key] = Node(key, value)
            self._insert(self._cache[key])

        # Remove the LRU value if the cache is full
        if len(self._cache) > self._capacity:
            self._remove(self._leftNode.next)
            self._cache.pop(self._leftNode.next.key)

    def _remove(self, node: Node) -> None:
        """Remove a node from the double-linked list"""
        left, right = node.prev, node.next
        left.next, right.prev = right, left

    def _insert(self, node: Node) -> None:
        """Insert a node on the right of the double-linked list"""
        prev = self._rightNode.prev
        prev.next, self._rightNode.prev = node, node
        node.next, node.prev = self._rightNode, prev


if __name__ == "__main__":
    lru_cache = LRUCache(2)
    lru_cache.put(1, 1)
    lru_cache.put(2, 2)
    print(lru_cache.get(1))
    lru_cache.put(3, 3)
    print(lru_cache.get(1))
    print(lru_cache.get(2))
    print(lru_cache.get(3))
    lru_cache.put(4, 4)
    print(lru_cache.get(1))
    print(lru_cache.get(3))
    print(lru_cache.get(4))
