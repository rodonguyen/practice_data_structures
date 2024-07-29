from graph_adjacency_list import GraphAdjacencyList, DirectedGraphAdjacencyList

print('--  THE GRAPH  --')
vertices = {0, 1, 2, 3, 4, 5}
edges = {(0, 1), (1, 2), (0, 3), (1, 3), (3, 4), (2, 5), (4, 5), (2, 4)}
graph = DirectedGraphAdjacencyList(vertices=vertices, edges=edges)
graph.insert_edge((5,6))
graph.insert_edge((5,1))
graph.print_graph()




parents = {}
  
def bfs(graph, start_node):  
  visited = [start_node]
  queue = [start_node]
  while len(queue) != 0:
    processing_node = queue.pop(0)
    print(processing_node, end=' ')

    if my_action(node=processing_node, target=target): break

    for neighbour in graph.adjacency_list[processing_node]:

      if neighbour not in visited:
        visited.append(neighbour)
        queue.append(neighbour)
        parents[neighbour] = processing_node

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

start = 0
target = 6
bfs(graph=graph, start_node=start)
print(parents)



print_path_to_target()