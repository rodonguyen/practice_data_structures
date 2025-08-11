#!/usr/bin/env python3
"""
Solution for finding maximum concurrent streams using difference array approach.
Time complexity: O(n + MAX_TIME) where MAX_TIME = 100,000
Space complexity: O(MAX_TIME)
"""

from typing import List, Union

# Type alias for a stream: [user_id, start_time, end_time]
StreamType = List[Union[str, int]]

def max_concurrent_streams(streams: List[StreamType]) -> int:
    """
    Find the maximum number of concurrent streams.
    
    Uses half-open intervals [start, end) so that adjacent streams don't double-count.
    
    Args:
        streams: List of [user_id, start_time, end_time] where times are integers [0, 100000]
        
    Returns:
        int: Maximum number of concurrent streams
    """
    if not streams:
        return 0
    
    # Difference array approach with half-open intervals [start, end)
    MAX_TIME = 100001
    diff = [0] * MAX_TIME
    
    # Build difference array
    for user_id, start, end in streams:
        diff[start] += 1
        if end < MAX_TIME:
            diff[end] -= 1
    
    # Convert difference array to actual counts and find maximum
    current_concurrent = 0
    max_concurrent = 0
    
    for delta in diff:
        current_concurrent += delta
        max_concurrent = max(max_concurrent, current_concurrent)
    
    return max_concurrent


def solve_concurrent_streams(streams: List[StreamType]) -> str:
    """
    Main function that accepts input and prints the required answer format.
    
    Args:
        streams: List of [user_id, start_time, end_time]
        
    Returns:
        str: The formatted result string
    """
    max_concurrent = max_concurrent_streams(streams)
    result = f"The maximum number of concurrent streams is {max_concurrent}."
    print(result)
    return result


if __name__ == "__main__":
    # Test with the provided examples
    
    example1 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000]
    ]
    print("Example 1:")
    solve_concurrent_streams(example1)
    print()
    
    example2 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000],
        ["User_003", 2500, 3000],
        ["User_004", 400, 1400]
    ]
    print("Example 2:")
    solve_concurrent_streams(example2)
    print()
    
    example3 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000],
        ["User_003", 2500, 3000],
        ["User_004", 400, 1400],
        ["User_001", 1100, 1800],
        ["User_005", 1200, 1400],
        ["User_006", 500, 2400],
        ["User_003", 2100, 2300]
    ]
    print("Example 3:")
    solve_concurrent_streams(example3)
    print()
    
    example4 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000],
        ["User_003", 2500, 3000],
        ["User_001", 1100, 1800],
        ["User_002", 600, 2400],
        ["User_002", 700, 1800]
    ]
    print("Example 4:")
    solve_concurrent_streams(example4)