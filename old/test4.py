from dataclasses import dataclass
from typing import Dict, List


@dataclass
class Tracker:
    course_id: str
    counter: Dict
    most_popular_next: str
    most_popular_counter: int = 1

    def add_next_watched_course(self, next_course_id):
        # increase counter
        self.counter[next_course_id] = self.counter.get(next_course_id, 0) + 1

        # update most popular next if applicable
        if self.counter[next_course_id] > self.most_popular_counter:
            self.most_popular_counter += 1
            self.most_popular_next = next_course_id


def get_the_popular_next(input: List[List]):
    trackers: Dict[str, Tracker] = {}
    for course_history in input:
        for i in range(len(course_history) - 1):
            course_id = course_history[i]
            next_course_id = course_history[i + 1]
            if not trackers.get(course_id, False):
                trackers[course_id] = Tracker(
                    course_id=course_id,
                    counter={next_course_id: 1},
                    most_popular_next=next_course_id,
                )
            else:
                trackers[course_id].add_next_watched_course(next_course_id)

    result = []
    for course_id, tracker in trackers.items():
        result.append([course_id, tracker.most_popular_next])

    return result


input = [
    ["Course_001", "Course_002", "Course_003", "Course_004"],
    ["Course_001", "Course_003"],
    ["Course_002", "Course_004", "Course_001"],
    ["Course_004", "Course_002", "Course_003", "Course_001"],
    ["Course_004", "Course_003", "Course_002", "Course_001"],
]

print(get_the_popular_next(input))
