using System;
using System.Collections.Generic;

namespace Xero
{
    public class Node
    {
        public int Key { get; set; }
        public int Value { get; set; }
        public Node Prev { get; set; } = null!;
        public Node Next { get; set; } = null!;

        public Node(int key, int value)
        {
            Key = key;
            Value = value;
        }
    }

    public class LRUCache
    {
        private readonly int _capacity;
        private readonly Dictionary<int, Node> _cache;
        private readonly Node _leftNode; // Least Recently Used
        private readonly Node _rightNode; // Most Recently Used

        public LRUCache(int capacity)
        {
            _capacity = capacity;
            _cache = new Dictionary<int, Node>();

            // Initialize dummy nodes
            _leftNode = new Node(0, 0);
            _rightNode = new Node(0, 0);

            // Connect dummy nodes
            _leftNode.Next = _rightNode;
            _rightNode.Prev = _leftNode;
        }

        public int Get(int key)
        {
            if (!_cache.ContainsKey(key))
            {
                return -1;
            }

            // Move the node to the right of the cache
            Node node = _cache[key];
            Remove(node);
            Insert(node);

            return node.Value;
        }

        public void Put(int key, int value)
        {
            if (_cache.ContainsKey(key))
            {
                // Update the value of the node
                _cache[key].Value = value;
                Remove(_cache[key]);
                Insert(_cache[key]);
                return;
            }

            // Create a new node
            _cache[key] = new Node(key, value);
            Insert(_cache[key]);

            // Remove the LRU value if the cache is full
            if (_cache.Count > _capacity)
            {
                Node lruNode = _leftNode.Next;
                Remove(lruNode);
                _cache.Remove(lruNode.Key);
            }
        }

        private void Remove(Node node)
        {
            // Remove a node from the double-linked list
            Node left = node.Prev;
            Node right = node.Next;
            left.Next = right;
            right.Prev = left;
        }

        private void Insert(Node node)
        {
            // Insert a node on the right of the double-linked list
            Node prev = _rightNode.Prev;
            prev.Next = node;
            _rightNode.Prev = node;
            node.Next = _rightNode;
            node.Prev = prev;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Testing LRUCache");
            LRUCache lruCache = new LRUCache(2);
            lruCache.Put(1, 1);
            lruCache.Put(2, 2);
            Console.WriteLine(lruCache.Get(1));
            lruCache.Put(3, 3);
            Console.WriteLine(lruCache.Get(1));
            Console.WriteLine(lruCache.Get(2));
            Console.WriteLine(lruCache.Get(3));
            lruCache.Put(4, 4);
            Console.WriteLine(lruCache.Get(1));
            Console.WriteLine(lruCache.Get(3));
            Console.WriteLine(lruCache.Get(4));
        }
    }
}
