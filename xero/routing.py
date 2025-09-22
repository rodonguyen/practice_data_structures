"""
Trie-based Routing System Demo

This demonstrates how Trie data structures are used for efficient URL routing
in web frameworks. Trie routing allows for:
- O(m) lookup time where m is the length of the path
- Efficient handling of dynamic routes with parameters
- Prefix matching and wildcard support
"""

from typing import Dict, List, Optional, Callable, Any
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed


class TrieNode:
    """Node in the Trie structure for storing route information"""

    def __init__(self):
        self.children: Dict[str, "TrieNode"] = {}
        self.handler: Optional[Callable] = None
        self.is_end: bool = False
        self.param_name: Optional[str] = None  # For dynamic routes like /user/:id
        self.wildcard: bool = False  # For catch-all routes like /files/*


class TrieRouter:
    """Trie-based router for handling HTTP-like requests with thread safety"""

    def __init__(self):
        self.root = TrieNode()
        self.route_count = 0
        # Thread safety mechanisms
        self._read_lock = threading.RLock()  # Reentrant read lock
        self._write_lock = threading.RLock()  # Reentrant write lock
        self._readers_count = 0
        self._readers_count_lock = threading.Lock()

    def add_route(self, path: str, handler: Callable) -> None:
        """
        Add a route to the trie (ATOMIC OPERATION)

        Uses write lock to ensure atomicity during route registration.
        This prevents race conditions when multiple threads try to add routes simultaneously.

        Args:
            path: Route path (e.g., '/users', '/users/:id', '/files/*')
            handler: Function to call when route matches
        """
        with self._write_lock:  # Exclusive write lock
            if not path.startswith("/"):
                path = "/" + path

            node = self.root
            segments = path.split("/")[1:]  # Remove empty first element

            for i, segment in enumerate(segments):
                if not segment:  # Handle trailing slash
                    continue

                # Check for dynamic parameter (:param)
                if segment.startswith(":"):
                    param_name = segment[1:]
                    if node.param_name and node.param_name != param_name:
                        raise ValueError(
                            f"Conflicting parameter names: {node.param_name} vs {param_name}"
                        )
                    node.param_name = param_name
                    if segment not in node.children:
                        node.children[segment] = TrieNode()
                    node = node.children[segment]

                # Check for wildcard (*)
                elif segment == "*":
                    node.wildcard = True
                    if "*" not in node.children:
                        node.children["*"] = TrieNode()
                    node = node.children["*"]

                # Regular path segment
                else:
                    if segment not in node.children:
                        node.children[segment] = TrieNode()
                    node = node.children[segment]

            node.handler = handler
            node.is_end = True
            self.route_count += 1
            print(f"✓ Added route: {path} -> {handler.__name__}")

    def find_route(self, path: str) -> tuple[Optional[Callable], Dict[str, str]]:
        """
        Find route handler and extract parameters

        Args:
            path: Request path to match

        Returns:
            Tuple of (handler_function, parameters_dict)
        """
        if not path.startswith("/"):
            path = "/" + path

        node = self.root
        segments = path.split("/")[1:]
        params = {}

        for i, segment in enumerate(segments):
            if not segment:  # Handle trailing slash
                continue

            # Try exact match first
            if segment in node.children:
                node = node.children[segment]

            # Try parameter match (:param)
            elif node.param_name:
                params[node.param_name] = segment
                # Find the parameter node
                for key, child_node in node.children.items():
                    if key.startswith(":"):
                        node = child_node
                        break
                else:
                    return None, {}

            # Try wildcard match (*)
            elif node.wildcard:
                # Capture remaining path as wildcard value
                remaining_path = "/".join(segments[i:])
                params["*"] = remaining_path
                node = node.children["*"]
                break

            else:
                return None, {}

        if node.is_end and node.handler:
            return node.handler, params

        return None, {}


# Route handler functions
def home_handler(params: Dict[str, str]) -> str:
    """Handle home page requests"""
    return f"🏠 Welcome to Home Page! Params: {params}"


def users_handler(params: Dict[str, str]) -> str:
    """Handle users list requests"""
    return f"👥 Users List Page! Params: {params}"


def user_detail_handler(params: Dict[str, str]) -> str:
    """Handle individual user requests"""
    user_id = params.get("id", "unknown")
    return f"👤 User Detail Page for ID: {user_id}"


def posts_handler(params: Dict[str, str]) -> str:
    """Handle posts list requests"""
    return f"📝 Posts List Page! Params: {params}"


def post_detail_handler(params: Dict[str, str]) -> str:
    """Handle individual post requests"""
    post_id = params.get("id", "unknown")
    return f"📄 Post Detail Page for ID: {post_id}"


def files_handler(params: Dict[str, str]) -> str:
    """Handle file requests with wildcard"""
    file_path = params.get("*", "")
    return f"📁 File Request: {file_path}"


def api_handler(params: Dict[str, str]) -> str:
    """Handle API requests"""
    return f"🔌 API Endpoint! Params: {params}"


def search_handler(params: Dict[str, str]) -> str:
    """Handle search requests"""
    query = params.get("query", "")
    return f"🔍 Search Results for: '{query}'"


class SimpleServer:
    """Simple HTTP-like server simulation"""

    def __init__(self):
        self.router = TrieRouter()
        self.setup_routes()

    def setup_routes(self):
        """Configure all routes"""
        print("Setting up routes...")

        # Static routes
        self.router.add_route("/", home_handler)
        self.router.add_route("/users", users_handler)
        self.router.add_route("/posts", posts_handler)
        self.router.add_route("/api", api_handler)

        # Dynamic routes with parameters
        self.router.add_route("/users/:id", user_detail_handler)
        self.router.add_route("/posts/:id", post_detail_handler)
        self.router.add_route("/search/:query", search_handler)

        # Wildcard routes
        self.router.add_route("/files/*", files_handler)

        print(f"\nTotal routes registered: {self.router.route_count}\n")

    def handle_request(self, method: str, path: str) -> str:
        """Handle incoming request"""
        print(f"📨 {method} {path}")

        handler, params = self.router.find_route(path)

        if handler:
            response = handler(params)
            print(f"✅ Response: {response}")
            return response
        else:
            error_msg = f"❌ 404 Not Found: {path}"
            print(error_msg)
            return error_msg


def demonstrate_routing():
    """Demonstrate the Trie routing system"""
    print("=" * 60)
    print("🚀 TRIE-BASED ROUTING SYSTEM DEMO")
    print("=" * 60)

    server = SimpleServer()

    # Test cases demonstrating different routing scenarios
    test_cases = [
        # Static routes
        ("GET", "/"),
        ("GET", "/users"),
        ("GET", "/posts"),
        ("GET", "/api"),
        # Dynamic routes
        ("GET", "/users/123"),
        ("GET", "/users/456"),
        ("GET", "/posts/789"),
        ("GET", "/search/python"),
        ("GET", "/search/data-structures"),
        # Wildcard routes
        ("GET", "/files/images/photo.jpg"),
        ("GET", "/files/documents/report.pdf"),
        ("GET", "/files/videos/movie.mp4"),
        # Edge cases
        ("GET", "/users/"),
        ("GET", "/nonexistent"),
        ("GET", "/users/123/posts"),  # Should not match /users/:id
    ]

    print("\n🧪 Testing various routes:")
    print("-" * 40)

    for method, path in test_cases:
        server.handle_request(method, path)
        print()

    print("=" * 60)
    print("📊 TRIE STRUCTURE ANALYSIS")
    print("=" * 60)

    def analyze_trie(node: TrieNode, depth: int = 0, path: str = "") -> None:
        """Analyze and display trie structure"""
        indent = "  " * depth

        if node.is_end:
            handler_name = node.handler.__name__ if node.handler else "None"
            print(f"{indent}📌 {path} -> {handler_name}")

        for segment, child in node.children.items():
            new_path = f"{path}/{segment}" if path else segment
            print(f"{indent}📁 {segment}")
            analyze_trie(child, depth + 1, new_path)

    print("Trie structure:")
    analyze_trie(server.router.root)

    print(f"\n📈 Performance Metrics:")
    print(f"• Total routes: {server.router.route_count}")
    print(f"• Lookup complexity: O(m) where m = path length")
    print(f"• Memory efficiency: Shared prefixes reduce storage")
    print(f"• Dynamic routing: Parameter extraction in single pass")


if __name__ == "__main__":
    demonstrate_routing()
