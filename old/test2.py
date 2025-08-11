from dataclasses import dataclass
from typing import Dict


@dataclass
class CourseWatchCount:
    course_id: str
    watch_counter: int


def courses_completed_by_one(input: Dict):
    watched: Dict[CourseWatchCount] = {}
    for user, courses in input.items():
        for c in courses:
            watched[c] = watched.get(c, 0) + 1

    only_one_finishes: list[str] = []
    for course, watched_times in watched.items():
        if watched_times == 1:
            only_one_finishes.append(course)

    return only_one_finishes


if __name__ == "__main__":
    import json

    input = json.loads(
        """
{
  "Learner-0001": [
    "Course-0001",
    "Course-0002",
    "Course-0003"
  ],
  "Learner-0002": [
    "Course-0002",
    "Course-0003"
  ],
  "Learner-0003": [
    "Course-0002",
    "Course-0003",
    "Course-0004"
  ]
}

"""
    )

    print(courses_completed_by_one(input))
