

# 2. 6279. Distinct Prime Factors of Product of Array

class Solution:
    def distinctPrimeFactors(self, nums: List[int]) -> int:
        max_item = max(nums)
        print(max_item)
        prime_nums_needed = []
        
        # Get all primes nums less than max item
        for prime in range(2,max_item+1):
            if prime == 2 or prime == 3:
                # print('case 1')
                prime_nums_needed.append(prime)
                continue     
                      
            is_prime = True
            # print('case 2')
            for i in range(2,prime):
                if prime % i == 0:
                    is_prime = False
                    break
            if is_prime:
                prime_nums_needed.append(prime)
                
        print('prime_nums_needed=', prime_nums_needed)    
        
        
        product = 1
        for i in nums:
            product *= i
        print('product=', product)    
        
        result = 0
        for prime in prime_nums_needed:
            if product % prime == 0:
                result += 1
        
        print('result:', result)
        return result


# 3. 6196. Partition String Into Substrings With Values at Most K

class Solution:
    def minimumPartition(self, s: str, k: int) -> int:
        length = len(s)
        remaining_digit = length
        
        result = 0
        prev_length = 1
        start_pointer = 0
        
        if k < 9:
            for i in s:
                if int(i) > k:
                    print('Oops, can\'t do.')
                    return -1
        
        while remaining_digit > 0:
            while True:
                current_length = prev_length + 1
                if current_length > remaining_digit or int(s[start_pointer : start_pointer + current_length]) > k:
                    print('substring:', s[start_pointer : start_pointer + current_length -1])
                    result += 1
                    remaining_digit -= prev_length

                    start_pointer += prev_length
                    prev_length = 1
                    break
                    
                # if int(s[start_pointer : start_pointer + current_length]) <= k:
                prev_length = current_length

        
        return result
        

# 4. 6280. Closest Prime Numbers in Range
def euler_prime_flag(n):
    # Returns all prime numbers less than or equal to n
    not_prime_flag = [False for _ in range(n + 1)]
    prime_numbers = []
    for num in range(2, n + 1):
        if not not_prime_flag[num]:
            prime_numbers.append(num)
        for prime in prime_numbers:
            if num * prime > n: # Exceed not_prime_flag range
                break
            not_prime_flag[num * prime] = True
            # if num % prime == 0:  # ???
            #     break
    return prime_numbers

class Solution:
    def closestPrimes(self, left: int, right: int) -> List[int]:
        primes = euler_prime_flag(right)
        # print(primes)
        
        # primes_in_range = [prime for prime in primes if prime >= left]

        primes_in_range = []
        for i in primes:
            if left <= i:
                primes_in_range.append(i)
                
        if len(primes_in_range) < 2: return [-1, -1]

        smallest_diff = 1e6
        result = []
        for i in range(0, len(primes_in_range)-1):
            diff = primes_in_range[i+1] - primes_in_range[i]
            if diff < smallest_diff:
                print(primes_in_range[i:i+2])
                smallest_diff = diff
                result = primes_in_range[i:i+2]
        return result

    