"""
Google Gemini AI service for audio summary generation
"""
import google.generativeai as genai
from ..config import settings
import logging

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')


async def generate_audio_summary(content: str) -> str:
    """
    Generate simplified audio-friendly explanation using Gemini
    """
    prompt = f"""
You are an expert physics teacher creating an audio explanation for students learning quantum mechanics.

Original Content:
{content}

Task: Convert this into a simplified, audio-friendly explanation (2-3 minutes when spoken) that:
1. Uses conversational, friendly tone
2. Breaks down complex equations into simple language
3. Includes 2-3 real-world analogies that students can visualize
4. Explains "why" concepts matter, not just "what" they are
5. Is suitable for verbal narration (no references to visual elements like "as shown above")

Format: Return only the narration text, no markdown or formatting.
    """
    
    try:
        response = model.generate_content(prompt)
        simplified_text = response.text
        
        logger.info(f"Gemini generated audio summary: {len(simplified_text)} characters")
        return simplified_text
    
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        raise Exception(f"Failed to generate audio summary: {str(e)}")