public class LRUCache
{
    private Dictionary<int, LinkedListNode<int>> _dict = new Dictionary<int, LinkedListNode<int>>();
    private LinkedList<int> _linkedList = new LinkedList<int>();
    private readonly int _capacity;

    public LRUCache(int capacity)
    {
        _capacity = capacity;
    }

    public int Get(int key)
    {
        Console.WriteLine("Get {0}", key);
        if (!_dict.ContainsKey(key))
        {
            Console.WriteLine("-> -1");
            return -1;
        }

        // Node may be removed from _linkedList but not in _dict
        var theNode = _dict[key];
        if (theNode.List == null)
        {
            _dict.Remove(key);
            return -1;
        }

        // Move theNode up the cache since it is just used
        _linkedList.Remove(theNode);
        _linkedList.AddFirst(theNode);

        int value = theNode.Value;
        // Console.WriteLine("-> {0}", value);
        return value;
    }

    public void Put(int key, int value)
    {
        Console.WriteLine("Put {0}-{1}", key, value);

        // Update value of an existing key in LRU
        if (_dict.ContainsKey(key))
        {
            // Make sure the node is still in _linkedList
            var existingNode = _dict[key];

            if (existingNode.List != null)
            {
                // Update the node value
                existingNode.Value = value;
                // Move the touched node to the top
                _linkedList.Remove(existingNode);
                _linkedList.AddFirst(existingNode);
                return;
            }
            else
            {
                // Remove if existingNode is not in _linkedList
                _dict.Remove(key);
            }
        }

        // if full, remove the last
        if (_dict.Count == _capacity)
        {
            _linkedList.RemoveLast();
        }

        // Add new value to the first
        var newAddedNode = _linkedList.AddFirst(value);
        _dict.Add(key, newAddedNode);
    }
}

/**
 * Your LRUCache object will be instantiated and called as such:
 * LRUCache obj = new LRUCache(capacity);
 * int param_1 = obj.Get(key);
 * obj.Put(key,value);
 */
