import os
from google.cloud import texttospeech
from typing import Optional

# Initialize client only if credentials are available
client: Optional[texttospeech.TextToSpeechClient] = None

try:
    creds_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if creds_path and os.path.exists(creds_path):
        client = texttospeech.TextToSpeechClient()
        print("✅ Google TTS initialized successfully")
    else:
        print("⚠️  Google TTS credentials not found. TTS features disabled.")
except Exception as e:
    print(f"⚠️  Could not initialize Google TTS: {e}")
    client = None


def text_to_speech(text: str, output_file: str) -> bool:
    """
    Convert text to speech and save to file
    Returns True if successful, False if TTS not available
    """
    if client is None:
        print("TTS not available")
        return False
    
    try:
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        with open(output_file, "wb") as out:
            out.write(response.audio_content)
        
        return True
    except Exception as e:
        print(f"TTS error: {e}")
        return False