from collections import deque, Counter, defaultdict
import collections
import heapq


class UndergroundSystem:

    def __init__(self):
        self.averageTime = dict()    # (start,end) -> [averageTime, number of trips]
        self.ongoingTravel = dict()  # id -> [startStation, timestamp]

    def checkIn(self, id: int, stationName: str, t: int) -> None:
        self.ongoingTravel[id] = [stationName, t]

    def checkOut(self, id: int, stationName: str, t: int) -> None:
        startStation, startTime = self.ongoingTravel[id]
        
        # not the first record of this trip
        if (startStation, stationName) in self.averageTime:
            averageTime, numberOfTrips = self.averageTime[(startStation, stationName)]
            self.averageTime[(startStation, stationName)][0] = \
                (averageTime*numberOfTrips + (t-startTime)) / (numberOfTrips+1)
            self.averageTime[(startStation, stationName)][1] += 1
            del self.ongoingTravel[id]
            return None
        
        # first record of this trip
        self.averageTime[(startStation, stationName)] = [t-startTime, 1]
        del self.ongoingTravel[id]
        return None

    def getAverageTime(self, startStation: str, endStation: str) -> float:
        return self.averageTime[(startStation, endStation)]

