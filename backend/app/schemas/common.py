from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    items: List[T]
    has_next: bool

class CheckAvailabilityResponse(BaseModel):
    """
    중복 확인 응답 스키마
    """
    is_available: bool
