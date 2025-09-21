import time
from collections import deque


class LeakyBucketRateLimiter:
    """
    Sliding window rate limiter for API requests.
    Allows configurable max requests per time window.
    """

    def __init__(self, max_requests: int = 4, window_size: int = 1):
        self.max_requests = max_requests
        self.window_size = window_size
        # Use deque to store timestamps of requests for sliding window
        self.requests = deque()

    def is_allowed(self) -> bool:
        current_time = time.time()

        # Remove requests older than the window
        while self.requests and self.requests[0] <= current_time - self.window_size:
            self.requests.popleft()

        # Check if we're under the limit
        if len(self.requests) < self.max_requests:
            self.requests.append(current_time)
            return True

        # Rate limit exceeded
        return False


class SlidingWindowCounterRateLimiter:
    """
    Sliding window counter rate limiter using mathematical approximation.
    More memory efficient than storing individual timestamps.
    """

    def __init__(self, max_requests: int = 4, window_size: int = 1):
        """
        Initialize sliding window counter rate limiter.

        Args:
            max_requests: Maximum number of requests allowed in the window
            window_size: Time window size in seconds
        """
        self.max_requests = max_requests
        self.window_size = window_size

        # Track two windows: current and previous
        self.current_window_start = time.time()
        self.current_window_requests = 0
        self.last_window_requests = 0

    def is_allowed(self) -> bool:
        """Formula: (1 - currentWindow%) * lastWindowRequestNum + currentWindowRequestNum + 1"""
        current_time = time.time()

        # Check if we need to slide the window
        self._slide_window_if_needed(current_time)

        # Calculate current window percentage
        current_window_percentage = (
            current_time - self.current_window_start
        ) / self.window_size

        estimated_requests = (
            (1 - current_window_percentage) * self.last_window_requests
            + self.current_window_requests
            + 1
        )

        # Check if adding this request would exceed the limit
        if estimated_requests <= self.max_requests:
            self.current_window_requests += 1
            return True

        return False

    def _slide_window_if_needed(self, current_time: float):
        time_since_window_start = current_time - self.current_window_start

        if time_since_window_start >= self.window_size:
            # More than one window has passed
            if time_since_window_start >= 2 * self.window_size:
                # More than two windows have passed, reset everything
                self.last_window_requests = 0
                self.current_window_requests = 0
            else:
                # One window has passed, slide the window
                self.last_window_requests = self.current_window_requests
                self.current_window_requests = 0

            # Update window start time
            self.current_window_start = current_time

    def get_current_count(self) -> int:
        """
        Get the current estimated number of requests in the sliding window.

        Returns:
            int: Estimated number of requests in current window
        """
        current_time = time.time()
        self._slide_window_if_needed(current_time)

        current_window_percentage = (
            current_time - self.current_window_start
        ) / self.window_size
        estimated_requests = (
            1 - current_window_percentage
        ) * self.last_window_requests + self.current_window_requests

        return int(estimated_requests)

    def get_remaining_requests(self) -> int:
        """
        Get the number of remaining requests in the current window.

        Returns:
            int: Number of remaining requests allowed
        """
        return max(0, self.max_requests - self.get_current_count())

    def get_window_info(self) -> dict:
        """
        Get detailed information about the current window state.

        Returns:
            dict: Window information including percentages and counts
        """
        current_time = time.time()
        self._slide_window_if_needed(current_time)

        current_window_percentage = (
            current_time - self.current_window_start
        ) / self.window_size

        return {
            "current_window_percentage": current_window_percentage,
            "current_window_requests": self.current_window_requests,
            "last_window_requests": self.last_window_requests,
            "estimated_total_requests": self.get_current_count(),
            "remaining_requests": self.get_remaining_requests(),
        }


# Test both implementations
if __name__ == "__main__":
    print("=== Testing Sliding Window Counter Rate Limiter ===")

    counter_limiter = SlidingWindowCounterRateLimiter()

    for i in range(20):
        result = counter_limiter.is_allowed()
        window_info = counter_limiter.get_window_info()

        print(f"Request {i+1}: {'ALLOWED' if result else 'BLOCKED'}")
        print(f"  Estimated requests: {window_info['estimated_total_requests']}")
        print(f"  Current window %: {window_info['current_window_percentage']:.2f}")
        print(f"  Current requests: {window_info['current_window_requests']}")
        print(f"  Last window requests: {window_info['last_window_requests']}")

        if i == 5 or i == 7 or i == 11 or i == 18:
            time.sleep(1)
            print("  sleep 1 second")
        else:
            time.sleep(0.01)
