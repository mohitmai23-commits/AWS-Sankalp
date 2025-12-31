"""
Text-to-Speech service using Google Cloud TTS
"""
from google.cloud import texttospeech
from ..config import settings
import logging
import os

logger = logging.getLogger(__name__)

# Set Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_APPLICATION_CREDENTIALS

client = texttospeech.TextToSpeechClient()


async def text_to_speech(text: str) -> tuple[bytes, int]:
    """
    Convert text to speech using Google Cloud TTS
    Returns: (audio_bytes, duration_seconds)
    """
    try:
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Neural2-J",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.95,
            pitch=0.0
        )
        
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        audio_bytes = response.audio_content
        
        # Estimate duration (rough: 150 words per minute)
        word_count = len(text.split())
        duration_seconds = int((word_count / 150) * 60)
        
        logger.info(f"Generated TTS audio: {len(audio_bytes)} bytes, ~{duration_seconds}s")
        
        return audio_bytes, duration_seconds
    
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise Exception(f"Failed to generate audio: {str(e)}")