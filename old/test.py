def get_max_concurrent_stream_sol1(input: list):
    stream_tracker = [0] * (86400 + 1)  # number of seconds in the day
    max_time = 0

    for user_id, start, end in input:
        stream_tracker[start] += 1
        stream_tracker[
            end
        ] -= 1  # assume that end time will not add more streams on top of the user that starts at the same time
        max_time = max(end, max_time)

    max_stream = 0
    number_of_streams = 0
    for i in range(0, max_time + 1):
        if stream_tracker[i] == 0:
            continue

        number_of_streams += stream_tracker[i]
        max_stream = max(number_of_streams, max_stream)

    return max_stream


def get_max_concurrent_stream_sol2(input: list):
    # add to a new list with "start" or "end" sign
    stream_record = []
    for user_id, start, end in input:
        stream_record.append([start, 1])
        stream_record.append([end, -1])

    stream_record.sort(key=lambda x: (x[0], x[1]))  # O(nlogn), also with this approach,
    # stream ending at the exact time another starts will not add 1 more to the concurrent stream number
    # print(stream_record)

    max_stream = 0
    current_stream = 0
    for record in stream_record:
        stream_difference = record[1]
        current_stream += stream_difference
        max_stream = max(max_stream, current_stream)

    return max_stream


if __name__ == "__main__":
    import json

    input = json.loads(
        """
[
    ["User_001", 0, 1000],
    ["User_002", 500, 2000],
    ["User_003", 2500, 3000],
    ["User_004", 400, 1400],
    ["1", 1000, 2000 ]
]
"""
    )
    print(get_max_concurrent_stream_sol1(input))
    print(get_max_concurrent_stream_sol2(input))
