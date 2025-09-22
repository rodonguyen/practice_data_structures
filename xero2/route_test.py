import unittest
from route import Router


class TestRoute(unittest.TestCase):

    def test_positive_case(self):
        router = Router()
        router.set("/foo", "bar")
        assert router.get("/foo") == "bar"

    def test_invalid_route(self):
        router = Router()
        assert router.validate_route("badroute") == False

    def test_empty_route_validation(self):
        router = Router()
        assert router.validate_route("") == False

    def test_set_invalid_route_raises_exception(self):
        router = Router()
        with self.assertRaises(Exception) as context:
            router.set("badroute", "bar")
        self.assertEqual(str(context.exception), "Route is invalid")

    def test_get_nonexistent_route(self):
        router = Router()
        with self.assertRaises(Exception) as context:
            router.get("/nonexistent")
        self.assertEqual(str(context.exception), "Route not found")
