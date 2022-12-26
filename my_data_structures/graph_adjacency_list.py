class GraphAdjacencyList():
  def __init__(self, vertices, edges) -> None:
    self.adjacency_list = self.construct(vertices, edges)

  def construct(self, vertices, edges):
    adjacency_list = {}
    for vertex in vertices:
      adjacency_list[vertex] = set()

    for edge in edges:
      v1 = edge[0]
      v2 = edge[1]
      adjacency_list[v1].add(v2)
      adjacency_list[v2].add(v1) # for undirected graph, comment this line out if the graph is directed.

    return adjacency_list
  
  def insert_edge(self, edge):
    v1 = edge[0]
    v2 = edge[1]

    if v1 not in self.adjacency_list.keys():
      print('Adding new vertex:', v1)
      self.adjacency_list[v1] = set()
    if v2 not in self.adjacency_list.keys():
      print('Adding new vertex:', v2)
      self.adjacency_list[v2] = set()

    self.adjacency_list[v1].add(v2)
    self.adjacency_list[v2].add(v1) # for undirected graph, comment this line out if the graph is directed.

  def delete_edge(self, edge):
    if edge[0] not in self.adjacency_list.keys():
      print(f'Warning: Vertice = {edge[0]} does not exist in the vertices set. Action terminated.')
      return 
    if edge[1] not in self.adjacency_list.keys():
      print(f'Warning: Vertice = {edge[1]} does not exist in the vertices set. Action terminated.')
      return 

    v1 = edge[0]
    v2 = edge[1]
    self.adjacency_list[v1].discard(v2)
    self.adjacency_list[v2].discard(v1) # for undirected graph, comment this line out if the graph is directed.


  def print_graph(self):
    print("The adjacency lists representing the graph:")
    print('{')
    for key in self.adjacency_list:
      print(f'  {key}: {self.adjacency_list[key]}')
    print('}')


vertices = {0, 1, 2, 3, 4, 5}
edges = {(0, 1), (1, 2), (0, 3), (1, 3), (3, 4), (2, 5), (4, 5), (2, 4)}
graph = GraphAdjacencyList(vertices=vertices, edges=edges)
graph.print_graph()

graph.insert_edge((5,6))
graph.insert_edge((5,1))
graph.print_graph()

set().discard(5)
graph.delete_edge((1,0))
graph.delete_edge((3,1))
graph.delete_edge((9,1))
graph.print_graph()


####################################
#           DIRECTED GRAPH         #
####################################
class DirectedGraphAdjacencyList():
  def __init__(self, vertices, edges) -> None:
    self.adjacency_list = self.construct(vertices, edges)

  def construct(self, vertices, edges):
    adjacency_list = {}
    for vertex in vertices:
      adjacency_list[vertex] = set()

    for edge in edges:
      v1 = edge[0]
      v2 = edge[1]
      adjacency_list[v1].add(v2)
      # adjacency_list[v2].add(v1) # for undirected graph, comment this line out if the graph is directed.

    return adjacency_list
  
  def insert_edge(self, edge):
    v1 = edge[0]
    v2 = edge[1]

    if v1 not in self.adjacency_list.keys():
      print('Adding new vertex:', v1)
      self.adjacency_list[v1] = set()
    if v2 not in self.adjacency_list.keys():
      print('Adding new vertex:', v2)
      self.adjacency_list[v2] = set()

    self.adjacency_list[v1].add(v2)
    # self.adjacency_list[v2].add(v1) # for undirected graph, comment this line out if the graph is directed.

  def delete_edge(self, edge):
    if edge[0] not in self.adjacency_list.keys():
      print(f'Warning: Vertice = {edge[0]} does not exist in the vertices set. Action terminated.')
      return 
    if edge[1] not in self.adjacency_list.keys():
      print(f'Warning: Vertice = {edge[1]} does not exist in the vertices set. Action terminated.')
      return 

    v1 = edge[0]
    v2 = edge[1]
    self.adjacency_list[v1].discard(v2)
    # self.adjacency_list[v2].discard(v1) # for undirected graph, comment this line out if the graph is directed.

vertices = {0, 1, 2, 3, 4, 5}
edges = {(0, 1), (1, 2), (0, 3), (1, 3), (3, 4), (2, 5), (4, 5), (2, 4)}
graph = GraphAdjacencyList(vertices=vertices, edges=edges)
graph.print_graph()

graph.insert_edge((5,6))
graph.insert_edge((5,1))
graph.print_graph()

set().discard(5)
graph.delete_edge((1,0))
graph.delete_edge((3,1))
graph.delete_edge((9,1))
graph.print_graph()