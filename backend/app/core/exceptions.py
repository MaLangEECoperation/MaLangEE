class ServiceException(Exception):
    """Base exception for service layer"""
    pass

class UserAlreadyExistsError(ServiceException):
    def __init__(self, message: str = "User already exists"):
        self.message = message
        super().__init__(self.message)

class UserInactiveError(ServiceException):
    def __init__(self, message: str = "User is inactive"):
        self.message = message
        super().__init__(self.message)
