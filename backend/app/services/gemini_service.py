"""
Google Gemini AI service for audio summary generation
WITH FALLBACK for quota issues and network timeouts
"""
import google.generativeai as genai
from ..config import settings
import logging
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Thread pool for running sync Gemini calls
_executor = ThreadPoolExecutor(max_workers=2)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')


async def generate_audio_summary(content: str) -> str:
    """
    Generate simplified audio-friendly explanation using Gemini
    Falls back to rule-based summarization if API fails
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
        # Run Gemini API call with 10 second timeout
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(_executor, model.generate_content, prompt),
            timeout=10.0
        )
        simplified_text = response.text
        
        logger.info(f"✅ Gemini generated audio summary: {len(simplified_text)} characters")
        return simplified_text
    
    except asyncio.TimeoutError:
        logger.warning("⏱️ Gemini API timed out after 10s. Using fallback summarizer.")
        return _generate_fallback_summary(content)
    
    except Exception as e:
        error_msg = str(e)
        
        # Check if it's a quota/rate limit error
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            logger.warning(f"⚠️ Gemini API quota exceeded. Using fallback summarizer.")
            logger.warning(f"   Error: {error_msg[:200]}")
            return _generate_fallback_summary(content)
        else:
            # For other errors, log and use fallback
            logger.error(f"❌ Gemini API error: {error_msg}")
            logger.warning(f"⚠️ Using fallback summarizer due to API error")
            return _generate_fallback_summary(content)


def _generate_fallback_summary(content: str) -> str:
    """
    Generate a simple but effective audio summary when Gemini is unavailable
    Uses rule-based text processing to create a conversational summary
    """
    logger.info("🔄 Generating fallback audio summary...")
    
    # Clean the content
    content = content.strip()
    
    # Split into paragraphs
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    
    # If no clear paragraphs, split by sentences
    if len(paragraphs) <= 1:
        sentences = [s.strip() + '.' for s in content.split('.') if s.strip()]
        paragraphs = ['. '.join(sentences[i:i+3]) for i in range(0, len(sentences), 3)]
    
    # Extract key sentences (first sentence of each paragraph + last sentence)
    key_sentences = []
    for para in paragraphs[:4]:  # Max 4 paragraphs
        sentences = [s.strip() for s in para.split('.') if len(s.strip()) > 20]
        if sentences:
            key_sentences.append(sentences[0])
    
    # Build conversational summary
    summary_parts = [
        "Let me explain this concept in simple terms.",
        "",
    ]
    
    # Add key points with conversational connectors
    connectors = [
        "First, ",
        "Next, ",
        "Also, ",
        "Finally, ",
    ]
    
    for i, sentence in enumerate(key_sentences[:4]):
        # Simplify technical language
        simplified = _simplify_sentence(sentence)
        
        # Add connector
        if i < len(connectors):
            summary_parts.append(connectors[i] + simplified.lower())
        else:
            summary_parts.append(simplified)
    
    # Add closing
    summary_parts.extend([
        "",
        "Take your time to understand this concept. It's one of the fundamental ideas in quantum mechanics.",
        "Feel free to listen again or watch the video for more details."
    ])
    
    final_summary = "\n\n".join(summary_parts)
    
    logger.info(f"✅ Fallback summary generated: {len(final_summary)} characters")
    return final_summary


def _simplify_sentence(sentence: str) -> str:
    """
    Simplify a sentence by replacing complex terms with easier language
    """
    # Remove extra whitespace
    sentence = ' '.join(sentence.split())
    
    # Common physics term simplifications
    replacements = {
        r'Schrödinger equation': 'Schrodinger equation',
        r'ψ': 'psi',
        r'ℏ': 'h-bar',
        r'→': 'leads to',
        r'∞': 'infinity',
        r'Δ': 'delta',
        r'π': 'pi',
        r'\b(?:Thus|Hence|Therefore)\b': 'So',
        r'\b(?:Furthermore|Moreover)\b': 'Also',
        r'\b(?:utilize|employ)\b': 'use',
        r'\b(?:demonstrate|illustrate)\b': 'show',
        r'\b(?:comprises|constitutes)\b': 'is',
        r'\b(?:subsequently)\b': 'then',
        r'quantum mechanics': 'quantum physics',
        r'probability amplitude': 'wave function',
        r'eigenvalue': 'energy value',
        r'eigenfunction': 'energy state',
    }
    
    for pattern, replacement in replacements.items():
        sentence = re.sub(pattern, replacement, sentence, flags=re.IGNORECASE)
    
    # Make it more conversational
    if len(sentence) > 150:
        # Break long sentences
        if ', and' in sentence:
            sentence = sentence.replace(', and', '. And')
        elif ', which' in sentence:
            parts = sentence.split(', which', 1)
            sentence = parts[0] + '. This ' + parts[1] if len(parts) > 1 else sentence
    
    return sentence.strip()


# Test function
if __name__ == "__main__":
    test_content = """
The infinite potential well is one of the most fundamental models in quantum mechanics. It provides us with crucial insights into the quantum behavior of particles confined in space.

In this idealized system, a particle is trapped between infinitely high potential barriers. This means the particle cannot escape from the region, making it an excellent model for studying quantum confinement effects.
    """
    
    import asyncio
    
    async def test():
        result = await generate_audio_summary(test_content)
        print("\n" + "="*70)
        print("Generated Summary:")
        print("="*70)
        print(result)
        print("="*70)
    
    asyncio.run(test())