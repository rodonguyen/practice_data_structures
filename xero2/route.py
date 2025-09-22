class Router:
    routes = {}

    def validate_route(self, route: str) -> bool:
        if not route:
            return False
        if route[0] != "/":
            return False

        return True

    def set(self, route: str, response: str) -> None:
        if not self.validate_route(route):
            raise Exception("Route is invalid")

        self.routes[route] = response

    def get(self, route: str) -> str:
        if self.routes.get(route, False) == False:
            raise Exception("Route not found")
        return self.routes[route]
