def euler_flag_prime(n):
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
            if num % prime == 0:  # ???
                break
    return prime_numbers

p = euler_flag_prime(100)
print(len(p))