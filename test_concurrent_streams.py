#!/usr/bin/env python3
"""
Test cases for concurrent streams problem.
"""

from concurrent_streams import max_concurrent_streams

def test_max_concurrent_streams():
    """Test the max_concurrent_streams function with various cases."""
    
    # Test case 1: Given example - 2 concurrent
    streams1 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000]
    ]
    assert max_concurrent_streams(streams1) == 2, f"Test 1 failed"
    
    # Test case 2: Given example - 3 concurrent  
    streams2 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000],
        ["User_003", 2500, 3000],
        ["User_004", 400, 1400]
    ]
    assert max_concurrent_streams(streams2) == 3, f"Test 2 failed"
    
    # Test case 3: Complex example - max 5 concurrent at time 1200
    streams3 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000],
        ["User_003", 2500, 3000],
        ["User_004", 400, 1400],
        ["User_001", 1100, 1800],
        ["User_005", 1200, 1400],
        ["User_006", 500, 2400],
        ["User_003", 2100, 2300]
    ]
    assert max_concurrent_streams(streams3) == 5, "Test 3: Expected 5 concurrent streams"
    
    # Test case 4: Complex example - max 4 concurrent at time 700
    streams4 = [
        ["User_001", 0, 1000],
        ["User_002", 500, 2000],
        ["User_003", 2500, 3000],
        ["User_001", 1100, 1800],
        ["User_002", 600, 2400],
        ["User_002", 700, 1800]
    ]
    assert max_concurrent_streams(streams4) == 4, "Test 4: Expected 4 concurrent streams"
    
    # Edge case: Empty input
    assert max_concurrent_streams([]) == 0, "Empty input failed"
    
    # Edge case: Single stream
    assert max_concurrent_streams([["User_001", 0, 1000]]) == 1, "Single stream failed"
    
    # Edge case: End time equals start time (zero duration) - should be 0 with half-open intervals
    assert max_concurrent_streams([["User_001", 1000, 1000]]) == 0, "Zero duration failed"
    
    # Edge case: Adjacent streams (end of one = start of next)
    streams_adjacent = [
        ["User_001", 0, 1000],
        ["User_002", 1000, 2000]
    ]
    assert max_concurrent_streams(streams_adjacent) == 1, "Adjacent streams should count as 1 concurrent"
    
    # Edge case: All streams at same time
    streams_same = [
        ["User_001", 500, 1000],
        ["User_002", 500, 1000],
        ["User_003", 500, 1000]
    ]
    assert max_concurrent_streams(streams_same) == 3, "Same time streams failed"
    
    # Edge case: Non-overlapping streams
    streams_separate = [
        ["User_001", 0, 100],
        ["User_002", 200, 300],
        ["User_003", 400, 500]
    ]
    assert max_concurrent_streams(streams_separate) == 1, "Non-overlapping streams failed"
    
    # Edge case: Nested intervals
    streams_nested = [
        ["User_001", 0, 1000],      # Outer
        ["User_002", 100, 900],     # Inside User_001
        ["User_003", 200, 800]      # Inside User_002
    ]
    assert max_concurrent_streams(streams_nested) == 3, "Nested intervals failed"
    
    # Edge case: Maximum timestamp boundary
    streams_boundary = [
        ["User_001", 0, 100000],
        ["User_002", 50000, 100000]
    ]
    assert max_concurrent_streams(streams_boundary) == 2, "Boundary test failed"
    
    print("All tests passed!")

if __name__ == "__main__":
    test_max_concurrent_streams()