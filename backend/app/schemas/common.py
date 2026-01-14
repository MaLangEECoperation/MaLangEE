from pydantic import BaseModel

class CheckAvailabilityResponse(BaseModel):
    """
    중복 확인 응답 스키마
    """
    is_available: bool
