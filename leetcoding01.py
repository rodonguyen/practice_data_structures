from collections import deque, Counter, defaultdict
import collections
import heapq
import math
import bisect
from collections import Counter



class ChemicalMachine:
    def __init__(self):
        self.content = []

    def add(self, chemical):
        self.content.append(chemical)
        
    def apply_heat(self):
        content_size = len(self.content)
        
        if content_size > 2:
            self.content = ['UNKNOWN']
        
        counter = Counter(self.content)
        if content_size == 2:
            if counter['GREEN'] == 2:
                self.content = ['ORANGE']
            elif counter['GREEN'] == 1 and counter['YELLOW'] == 1:
                self.content = ['BROWN']
            else:
                self.content = ['UNKNOWN']

        elif content_size == 1:
            if counter['ORANGE'] == 1:
                self.content = ['RED', 'RED']
            elif counter['BROWN'] == 1:
                self.content = ['MAGENTA']
            else:
                self.content = ['UNKNOWN']

    def empty_machine(self):
        result = self.content.copy()
        self.content = []
        return result


if __name__ == "__main__":
    machine = ChemicalMachine()

    machine.add("GREEN")
    machine.add("YELLOW")
    machine.apply_heat()
    print(",".join(machine.empty_machine()))  # should print BROWN

    machine.add("RED")
    machine.add("YELLOW")
    machine.apply_heat()
    print(",".join(machine.empty_machine()))  # should print UNKNOWN