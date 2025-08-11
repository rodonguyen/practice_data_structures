from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
from collections import defaultdict, Counter


@dataclass
class QuizAnalysis:
    easiest_question_index: int
    questions_by_difficulty: List[Tuple[int, int]]
    misleading_answers: Dict[int, str]


class QuizAnalyzer:
    def __init__(self, correct_answers: List[str]) -> None:
        self.correct_answers = correct_answers
    
    def analyze_responses(self, student_responses: List[List[str]]) -> QuizAnalysis:
        correct_counts = self._count_correct_answers(student_responses)
        misleading_answers = self._find_misleading_answers(student_responses)
        
        easiest_index = max(correct_counts.items(), key=lambda x: x[1])[0]
        questions_by_difficulty = sorted(correct_counts.items(), key=lambda x: x[1], reverse=True)
        
        return QuizAnalysis(
            easiest_question_index=easiest_index,
            questions_by_difficulty=questions_by_difficulty,
            misleading_answers=misleading_answers
        )
    
    def _count_correct_answers(self, student_responses: List[List[str]]) -> Dict[int, int]:
        correct_counts = defaultdict(int)
        
        for response in student_responses:
            for question_idx, answer in enumerate(response):
                if answer == self.correct_answers[question_idx]:
                    correct_counts[question_idx] += 1
        
        return dict(correct_counts)
    
    def _find_misleading_answers(self, student_responses: List[List[str]]) -> Dict[int, str]:
        incorrect_answers = defaultdict(list)
        
        for response in student_responses:
            for question_idx, answer in enumerate(response):
                if answer != self.correct_answers[question_idx]:
                    incorrect_answers[question_idx].append(answer)
        
        misleading_answers = {}
        for question_idx, wrong_answers in incorrect_answers.items():
            if wrong_answers:
                counter = Counter(wrong_answers)
                misleading_answers[question_idx] = counter.most_common(1)[0][0]
        
        return misleading_answers


class QuizReportGenerator:
    @staticmethod
    def print_analysis_report(analysis: QuizAnalysis) -> None:
        print(f"The easiest question is index {analysis.easiest_question_index}")
        
        print(analysis.questions_by_difficulty)
        questions_easiest_to_hardest = [q_idx for q_idx, _ in analysis.questions_by_difficulty]
        print(f"Questions from easiest to hardest {questions_easiest_to_hardest}")
        
        for question_idx, misleading_answer in analysis.misleading_answers.items():
            print(f"The most misleading answer for question {question_idx} is {misleading_answer}")


if __name__ == "__main__":
    correct_answers = ["A", "B", "A", "D", "C"]

    student_responses = [
        ["A", "B", "B", "C", "D"],
        ["C", "B", "A", "D", "B"],
        ["A", "B", "C", "D", "C"],
        ["B", "B", "A", "D", "A"],
        ["A", "B", "D", "B", "C"],
        ["C", "A", "A", "D", "A"],
        ["A", "B", "C", "D", "C"],
        ["B", "D", "A", "D", "A"],
        ["A", "D", "D", "D", "B"],
        ["C", "B", "A", "D", "B"],
        ["A", "C", "C", "D", "A"],
        ["B", "B", "A", "D", "A"],
        ["A", "B", "D", "C", "C"],
    ]

    analyzer = QuizAnalyzer(correct_answers)
    analysis = analyzer.analyze_responses(student_responses)
    
    report_generator = QuizReportGenerator()
    report_generator.print_analysis_report(analysis)

# 0: "A"

# B
# C
# D
# B
# B

# Question 0 has B as the most misleading answer
