def get_easiest_answer(correct_answer, user_answers):
    correct_counter = {answer: 0 for answer in correct_answer}

    for user_answer in user_answers:
        for index, answer in enumerate(user_answer):
            if answer == correct_answer[index]:
                correct_counter[correct_answer[index]] += 1

    max_num = 0
    easiest_index = -1
    for index, answer in enumerate(correct_answer):
        if correct_counter[answer] > max_num:
            easiest_index = index
            max_num = correct_counter[answer]

    print(f"The easiest answer is index {easiest_index}")


# get_easiest_answer(
#     ["A", "B", "C"],
#     [
#         ["A", "B", "B"],
#         ["C", "B", "C"],
#         ["A", "B", "C"],
#         ["B", "B", "A"],
#         ["A", "B", "C"],
#     ],
# )

if __name__ == "__main__":
    import ast

    input = """
// Correct Answers 
["A", "B", "C"]

// Learner Responses 
[
    ["A", "B", "B"],
    ["C", "B", "C"],
    ["A", "B", "C"],
    ["B", "B", "A"],
    ["A", "B", "C"]
]
"""
    lines = input.split("\n")
    correct_answer = ""
    learner_responses = ""
    for index, line in enumerate(lines):
        if line.__contains__("Correct Answers"):
            correct_answer = lines[index + 1].strip()
        if line.__contains__("Learner Responses"):
            learner_responses = "".join(lines[index + 1 :])

    learner_responses = ast.literal_eval(learner_responses)
    get_easiest_answer(correct_answer, learner_responses)
