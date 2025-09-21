import time


class LeakyBucketRateLimiter:
    def __init__(self, capacity: int, window_size: int):
        """capacity: the maximum number of tokens the bucket can hold
        window_size: the size of the window in seconds"""
        self.capacity = capacity
        self.window_size = window_size
        self.requests = deque()

    def is_allowed(self):
        """tokens: the number of tokens to request
        returns: True if the request is allowed, False otherwise"""

        current_time = time.time()
        while self.requests and self.requests[0] <= current_time - self.window_size:
            self.requests.popleft()

        if len(self.requests) < self.capacity:
            self.requests.append(current_time)
            return True

        return False


class SlidingWindowCounterRateLimiter:
    def __init__(self, capacity: int, window_size: int):
        self.capacity = capacity
        self.window_size = window_size
        self.current_window_start = time.time()
        self.current_window_requests = 0
        self.last_window_requests = 0

    def is_allowed(self):
        # Slide window if needed
        current_time = time.time()
        time_diff = current_time - self.current_window_start

        if time_diff > self.window_size:
            if time_diff > 2 * self.window_size:
                self.current_window_requests = 0
                self.last_window_requests = 0
            else:
                self.last_window_requests = self.current_window_requests
                self.current_window_requests = 0
            self.current_window_start = current_time

        # Estimate the num requests
        percentage_of_current_window_passed = time_diff / self.window_size
        estimated_num_requests = (
            self.last_window_requests * (1 - percentage_of_current_window_passed)
            + self.current_window_requests
            + 1
        )

        if estimated_num_requests <= self.capacity:
            self.current_window_requests += 1
            return True

        return False


if __name__ == "__main__":
    sliding_window_counter_rate_limiter = SlidingWindowCounterRateLimiter(
        capacity=10, window_size=1
    )
    for i in range(100):
        print(sliding_window_counter_rate_limiter.is_allowed())
        if i % 10 == 0:
            time.sleep(1)
