from collections import deque, Counter, defaultdict
import collections
import heapq
import math
import bisect
from collections import Counter


import ecdsa
import base58

def generate_key_pair():
    # Generate a new secp256k1 private key
    private_key = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)

    # Derive the corresponding public key
    public_key = private_key.get_verifying_key()

    # Return the private and public keys
    return private_key.to_string(), public_key.to_string()

def generate_bitcoin_address(public_key):
    # Compute the SHA-256 hash of the public key
    sha256_hash = ecdsa.util.sha256(public_key)

    # Compute the RIPEMD-160 hash of the SHA-256 hash
    ripemd160_hash = ecdsa.util.ripemd160(sha256_hash)

    # Add the version byte (0x00 for mainnet)
    versioned_hash = b'\x00' + ripemd160_hash

    # Compute the double SHA-256 checksum
    checksum = ecdsa.util.sha256(ecdsa.util.sha256(versioned_hash))[:4]

    # Append the checksum to the versioned hash
    binary_address = versioned_hash + checksum

    # Encode the binary address in Base58
    bitcoin_address = base58.b58encode(binary_address)

    return bitcoin_address

# Example usage
private_key, public_key = generate_key_pair()
bitcoin_address = generate_bitcoin_address(public_key)

print("Private Key:", private_key.hex())
print("Public Key:", public_key.hex())
print("Bitcoin Address:", bitcoin_address.decode())