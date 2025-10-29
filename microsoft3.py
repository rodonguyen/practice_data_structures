from typing import Dict


class DataPoint:
    def __init__(self, timestamp: int, value: int, labels: Dict[str, str]):
        self.timestamp = timestamp
        self.value = value
        self.labels = labels


class TimeSeriesService:
    # We are using array to store data, and data inserted only have older / larger timestamp

    data = []

    def insert(self, timestamp: int, value: int, labels: Dict[str, str]) -> None:
        # some logging may be needed
        self.data.append(DataPoint(timestamp, value, labels))

    def query(self, start_time: int, end_time: int, filters: Dict[str, str]) -> int:
        # O(max(log(n), k))

        # Do binary search to get starting DP
        l, r = 0, len(self.data) - 1

        while True:
            mid = (l + r) // 2

            # if no items from left-right, then get min item that larger than starttime
            if mid == l == r:
                break

            if self.data[mid].timestamp == start_time:
                break

            if self.data[mid].timestamp > start_time:
                l = mid + 1
            else:
                r = mid - 1

        cur_index = mid
        sum = 0
        while cur_index < end_time:
            isPassedFilter = True
            cur_dp = self.data[cur_index]
            for k in filters.keys():
                # check each filter
                if not (cur_dp.labels.get(k, False) and filters[k] == cur_dp.labels[k]):
                    isPassedFilter = False

            if not isPassedFilter:
                continue

            sum += cur_dp.value

        return 0
