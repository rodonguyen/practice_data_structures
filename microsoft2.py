def getNeuronStrengths(neuron_nodes, neuron_from, neuron_to, strongConnectivity):
    # Build adjacency list for the tree
    n = neuron_nodes
    adj = [[] for _ in range(n + 1)]

    for i in range(n - 1):
        u = neuron_from[i]
        v = neuron_to[i]
        adj[u].append(v)
        adj[v].append(u)

    result = []

    # For each neuron, find its maximum strength
    for node in range(1, n + 1):
        total_strength = 0

        # Try all possible subnetworks containing this neuron
        # We'll use DFS to explore all connected subgraphs containing 'neuron'
        visited = [False] * (n + 1)

        def dfs(node, current_node_strength):

            strength = current_node_strength
            for neighbor in adj[node]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    current_node_strength = (
                        1 if strongConnectivity[neighbor - 1] == 1 else -1
                    )
                    strength = max(
                        strength, dfs(neighbor, strength + current_node_strength)
                    )
                    # strength = max(current_node_strength, max_strength_from_search)
                    # if strongConnectivity[neighbor - 1] == 1:
                    #     strength += 1
                    #     strength = max(strength, dfs(neighbor, strength))
                    # else:
                    #     strength -= 1
                    #     strength = max(strength, dfs(neighbor, strength))

            return strength

        visited[node] = True
        for neighbor in adj[node]:
            visited[neighbor] = True
            # Start DFS from the current neuron
            total_strength += max(
                0, dfs(neighbor, 1 if strongConnectivity[neighbor - 1] == 1 else -1)
            )

        total_strength = (
            total_strength + 1
            if strongConnectivity[node - 1] == 1
            else total_strength - 1
        )

        result.append(total_strength)

    return result


# Test with the provided examples
if __name__ == "__main__":
    # Example 1
    neuron_nodes = 4
    neuron_from = [1, 1, 1]
    neuron_to = [2, 3, 4]
    strongConnectivity = [0, 0, 1, 0]

    print("Example 1:")
    print(getNeuronStrengths(neuron_nodes, neuron_from, neuron_to, strongConnectivity))
    # Expected: [0, -1, 1, -1]
    print(
        "is correct:",
        getNeuronStrengths(neuron_nodes, neuron_from, neuron_to, strongConnectivity)
        == [0, -1, 1, -1],
    )

    # Example 2
    neuron_nodes = 5
    neuron_from = [1, 1, 3, 3]
    neuron_to = [2, 3, 4, 5]
    strongConnectivity = [1, 1, 1, 1, 1]

    print("\nExample 2:")
    print(getNeuronStrengths(neuron_nodes, neuron_from, neuron_to, strongConnectivity))
    # Expected: [5, 5, 5, 5, 5]
    print(
        "is correct:",
        getNeuronStrengths(neuron_nodes, neuron_from, neuron_to, strongConnectivity)
        == [5, 5, 5, 5, 5],
    )

    # Example 3 - Testing pruning effectiveness
    neuron_nodes = 4
    neuron_from = [1, 2, 3]
    neuron_to = [2, 3, 4]
    strongConnectivity = [0, 1, 1, 0]

    print("\nExample 3 (custom test):")
    print(getNeuronStrengths(neuron_nodes, neuron_from, neuron_to, strongConnectivity))
    print(
        "is correct:",
        getNeuronStrengths(neuron_nodes, neuron_from, neuron_to, strongConnectivity)
        == [1, 2, 2, 1],
    )
