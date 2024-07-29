from graph_adjacency_list import GraphAdjacencyList, DirectedGraphAdjacencyList


print('--  THE GRAPH  --')
vertices = {0, 1, 2, 3, 4, 5}
edges = {(0, 1), (1, 2), (0, 3), (1, 3), (3, 4), (2, 5), (4, 5), (2, 4)}
graph = DirectedGraphAdjacencyList(vertices=vertices, edges=edges)
graph.insert_edge((5,6))
graph.insert_edge((5,1))
graph.print_graph()


 
def dfs(visited: list, node, kill_signal: bool):
  if kill_signal: return   # Terminate search if the target is found

  print(node)
  
  if my_action(node=node, target=target):
    kill_signal = True

  visited.append(node)

  for neighbour in graph.adjacency_list[node]:
    if neighbour not in visited:
      parents[neighbour] = node
      dfs(visited, neighbour, kill_signal)


def my_action(node, target=6):
  if node == target:
    print(f'Found {target}!')
    return True
    
def print_path_to_target():
  print('--  Path to Target  --')
  print(target)
  
  p = parents[target]
  while p in parents.keys():
    print(p)
    p = parents[p]
  print(start)

kill_signal = False
start = 0
target = 6
parents = {}
dfs(visited=[], node=start, kill_signal=kill_signal)
print(parents)



print_path_to_target()
