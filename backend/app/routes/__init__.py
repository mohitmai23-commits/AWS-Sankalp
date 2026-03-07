# backend/app/routes/__init__.py
from . import auth
from . import content
from . import cognitive_load
from . import engagement
from . import quiz
from . import audio
from . import notifications

__all__ = [
    "auth",
    "content", 
    "cognitive_load",
    "engagement",
    "quiz",
    "audio",
    "notifications"
]