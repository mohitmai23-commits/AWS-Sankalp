"""
Agentic AI Chatbot with Socratic Teaching Method
Features:
- Progressive hints instead of direct answers
- Probing questions to guide student thinking
- Multi-stage response (Probe → Hints → Explanation)
- Context-aware responses based on conversation history
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import google.generativeai as genai
from ..config import settings
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Thread pool for running sync Gemini calls
_executor = ThreadPoolExecutor(max_workers=2)

router = APIRouter()

# Configure Gemini
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    logger.info("✅ Gemini AI configured successfully (gemini-2.5-flash)")
except Exception as e:
    logger.error(f"❌ Failed to configure Gemini: {e}")
    model = None

# =============================================================================
# KNOWLEDGE BASE - Course Content organized by topics
# =============================================================================

KNOWLEDGE_BASE = {
    "1.1": {
        "title": "Introduction to Infinite Potential Well",
        "content": """
An infinite potential well (particle in a box) is a quantum mechanics model where a particle is confined between two impenetrable walls.

KEY CONCEPTS:
• Particle trapped between x = 0 and x = a
• Potential V(x) = 0 inside, V(x) = ∞ outside
• Particle cannot exist outside the box
• Only standing wave patterns allowed
• Energy is quantized
• Zero-point energy exists (lowest energy ≠ 0)

ANALOGY: Guitar string fixed at both ends - only certain vibration patterns allowed.
        """,
        "formulas": ["Eₙ = n²h²/(8ma²)", "ψₙ(x) = √(2/a) sin(nπx/a)"],
        "keywords": ["infinite well", "particle in box", "confinement", "quantization", "box", "trapped"],
    },
    "1.2": {
        "title": "Schrödinger Equation for Infinite Well",
        "content": """
The time-independent Schrödinger equation describes the quantum state.

EQUATION: d²ψ/dx² + (8π²mE/h²)ψ = 0  (inside well where V=0)

BOUNDARY CONDITIONS:
• ψ(0) = 0 and ψ(a) = 0

SOLUTION: ψₙ(x) = √(2/a) sin(nπx/a)

ENERGY EIGENVALUES: Eₙ = n²h²/(8ma²)
        """,
        "formulas": ["d²ψ/dx² + (8π²mE/h²)ψ = 0", "Eₙ = n²h²/(8ma²)"],
        "keywords": ["schrödinger", "schrodinger", "equation", "boundary conditions", "eigenvalue"],
    },
    "1.3": {
        "title": "Normalization and Probability",
        "content": """
Wave function must be normalized: ∫₀ᵃ |ψₙ(x)|² dx = 1

The probability of finding the particle somewhere must be 100%.

NORMALIZED WAVE FUNCTION: ψₙ(x) = √(2/a) sin(nπx/a)

PROBABILITY DENSITY: |ψₙ(x)|² gives probability of finding particle at position x.
        """,
        "formulas": ["∫₀ᵃ |ψₙ(x)|² dx = 1", "ψₙ(x) = √(2/a) sin(nπx/a)"],
        "keywords": ["normalization", "probability", "wave function", "density"],
    },
    "1.4": {
        "title": "Energy Quantization",
        "content": """
Energy can only take discrete values: Eₙ = n²h²/(8ma²)

KEY POINTS:
• n = 1, 2, 3, ... (quantum number)
• Ground state (n=1) has lowest energy E₁ = h²/(8ma²)
• Energy spacing increases: E₂ = 4E₁, E₃ = 9E₁
• Smaller box → higher energy (inverse square of width)
        """,
        "formulas": ["Eₙ = n²h²/(8ma²)", "Eₙ ∝ n²"],
        "keywords": ["energy", "quantization", "quantum number", "ground state", "discrete"],
    },
    "1.5": {
        "title": "Zero-Point Energy",
        "content": """
Even in the ground state (n=1), the particle has non-zero energy.

ZERO-POINT ENERGY: E₁ = h²/(8ma²)

This is a purely quantum effect - classically, a particle could have zero kinetic energy.

REASON: Heisenberg uncertainty principle - confining position increases momentum uncertainty.
        """,
        "formulas": ["E₁ = h²/(8ma²)", "ΔxΔp ≥ ℏ/2"],
        "keywords": ["zero-point", "ground state", "uncertainty principle", "heisenberg"],
    },
    "2.1": {
        "title": "Introduction to Finite Potential Well",
        "content": """
A finite potential well has walls of finite height V₀ instead of infinite.

KEY DIFFERENCES FROM INFINITE WELL:
• Wave function can extend slightly outside the well
• Particle can 'leak' into classically forbidden region
• Limited number of bound states
• Energy levels are lower than infinite well
        """,
        "formulas": ["V(x) = 0 for |x| < a/2", "V(x) = V₀ for |x| > a/2"],
        "keywords": ["finite well", "potential", "bound states", "evanescent"],
    },
    "2.2": {
        "title": "Wave Function in Finite Well",
        "content": """
INSIDE THE WELL: ψ oscillates (sine/cosine functions)
OUTSIDE THE WELL: ψ decays exponentially

The wave function is continuous and smooth at the boundaries.

DECAY CONSTANT: κ = √(2m(V₀-E))/ℏ
        """,
        "formulas": ["κ = √(2m(V₀-E))/ℏ", "ψ ∝ e^(-κ|x|) outside"],
        "keywords": ["wave function", "exponential decay", "continuity", "decay"],
    },
    "2.3": {
        "title": "Bound States in Finite Well",
        "content": """
Only a finite number of bound states exist in a finite well.

CONDITIONS:
• Energy must be less than V₀ (E < V₀)
• Wave function must go to zero at infinity
• Solutions come from transcendental equations

SHALLOW WELL: May have only 1 bound state
DEEP WELL: More bound states (approaches infinite well limit)
        """,
        "formulas": ["E < V₀ for bound states"],
        "keywords": ["bound states", "discrete", "transcendental", "shallow", "deep"],
    },
    "2.4": {
        "title": "Comparison: Finite vs Infinite Well",
        "content": """
KEY DIFFERENCES:

INFINITE WELL:
• ψ = 0 at walls (hard boundary)
• Infinite bound states
• Higher energies

FINITE WELL:
• ψ extends beyond walls (soft boundary)
• Limited bound states
• Lower energies (wave 'spreads out')
        """,
        "formulas": [],
        "keywords": ["comparison", "finite", "infinite", "differences"],
    },
    "3.1": {
        "title": "Introduction to Quantum Tunnelling",
        "content": """
Quantum tunnelling: particles can pass through barriers they classically couldn't.

CLASSICAL VIEW: Ball can't go over hill if it lacks energy
QUANTUM VIEW: Particle has probability to 'tunnel' through barrier

KEY REQUIREMENTS:
• Barrier of finite width and height
• Particle energy less than barrier height
• Wave function extends through barrier
        """,
        "formulas": ["T ∝ e^(-2κa)"],
        "keywords": ["tunnelling", "tunneling", "barrier", "transmission", "probability"],
    },
    "3.2": {
        "title": "Transmission Coefficient",
        "content": """
TRANSMISSION COEFFICIENT T: Probability of tunnelling through

T ≈ e^(-2κa) where κ = √(2m(V₀-E))/ℏ

DEPENDS ON:
• Barrier width a (exponential dependence!)
• Barrier height V₀
• Particle mass m
• Particle energy E

Doubling barrier width SQUARES the reduction in transmission probability.
        """,
        "formulas": ["T ≈ e^(-2κa)", "κ = √(2m(V₀-E))/ℏ"],
        "keywords": ["transmission coefficient", "probability", "exponential", "barrier width"],
    },
    "3.3": {
        "title": "Applications of Tunnelling",
        "content": """
1. ALPHA DECAY: Alpha particles tunnel out of nuclei
2. STM (Scanning Tunnelling Microscope): Images individual atoms
3. TUNNEL DIODES: Fast electronic switching
4. NUCLEAR FUSION: Protons tunnel through Coulomb barrier in stars
5. FLASH MEMORY: Electrons tunnel to store data
        """,
        "formulas": [],
        "keywords": ["alpha decay", "STM", "tunnel diode", "fusion", "applications", "microscope"],
    },
    "3.4": {
        "title": "Advanced Tunnelling Concepts",
        "content": """
TUNNELLING TIME: How long does tunnelling take? (Controversial!)

WKB APPROXIMATION: Calculate tunnelling for non-rectangular barriers
T ≈ exp(-2∫κ(x)dx)

RESONANT TUNNELLING: Double barriers can enhance transmission at certain energies.

QUANTUM COMPUTING: Tunnelling between qubit states is essential.
        """,
        "formulas": ["T ≈ exp(-2∫κ(x)dx)"],
        "keywords": ["WKB", "resonant tunnelling", "quantum computing", "time"],
    }
}


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class ChatRequest(BaseModel):
    question: str
    subtopic: Optional[str] = None
    user_id: Optional[int] = None
    conversation_history: Optional[List[Dict]] = []
    stage: Optional[str] = "new"  # new, probing, hint1, hint2, hint3, explaining


class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
    related_topics: List[str] = []
    stage: str = "probing"
    next_action: str = "wait_for_response"


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def search_knowledge_base(query: str) -> List[Dict]:
    """Search the knowledge base for relevant content"""
    query_lower = query.lower()
    results = []
    
    stop_words = {'what', 'is', 'the', 'a', 'an', 'how', 'why', 'when', 'where', 'tell', 
                  'me', 'about', 'explain', 'can', 'you', 'does', 'do', 'are', 'in', 'of'}
    query_words = set(query_lower.split()) - stop_words
    
    for subtopic_id, content in KNOWLEDGE_BASE.items():
        score = 0
        
        # Check keywords
        for keyword in content.get("keywords", []):
            if keyword.lower() in query_lower:
                score += 20
        
        # Check title
        if any(word in content["title"].lower() for word in query_words):
            score += 15
            
        # Check content
        content_lower = content["content"].lower()
        for word in query_words:
            if len(word) > 3 and word in content_lower:
                score += 5
        
        if score > 0:
            results.append({
                "subtopic_id": subtopic_id,
                "title": content["title"],
                "content": content["content"],
                "formulas": content.get("formulas", []),
                "score": score
            })
    
    results.sort(key=lambda x: x["score"], reverse=True)
    return results


def generate_fallback_response(question: str, relevant_content: List[Dict], stage: str) -> Dict:
    """Generate a response without Gemini API"""
    
    if not relevant_content:
        return {
            "answer": "🤔 I'm not sure which topic you're asking about. Could you be more specific?\n\nAre you asking about:\n• **Infinite Potential Well** (particle in a box)\n• **Finite Potential Well**\n• **Quantum Tunnelling**",
            "stage": "new",
            "next_action": "clarify_topic"
        }
    
    best_match = relevant_content[0]
    formulas = best_match.get("formulas", [])
    formula_text = "\n".join([f"  • {f}" for f in formulas]) if formulas else "  (See course notes)"
    
    if stage == "new":
        return {
            "answer": f"""🤔 Great question about **{best_match['title']}**!

Let me help you think through this step by step.

**First, ask yourself:** What do you already know about this topic? What concepts seem connected to your question?

Take a moment to think, then tell me what comes to mind. I'll guide you from there!""",
            "stage": "probing",
            "next_action": "wait_for_response"
        }
    
    elif stage in ["probing", "hint1"]:
        return {
            "answer": f"""💡 **Hint 1:** Let's break this down...

Looking at **{best_match['title']}**, here's something to consider:

{best_match['content'][:300]}...

**Think about:** How does this connect to your question? What pattern do you see?""",
            "stage": "hint1",
            "next_action": "wait_for_response"
        }
    
    elif stage == "hint2":
        return {
            "answer": f"""💡 **Hint 2:** You're getting closer!

The key formulas here are:
{formula_text}

**Consider:** How do these formulas relate to your question? What happens when you change the variables?""",
            "stage": "hint2",
            "next_action": "wait_for_response"
        }
    
    elif stage == "hint3":
        return {
            "answer": f"""💡 **Hint 3 (Final hint!):**

{best_match['content'][200:500]}...

Now try to put it all together. What's the answer to your original question?""",
            "stage": "hint3",
            "next_action": "wait_for_response"
        }
    
    else:  # explaining or final
        return {
            "answer": f"""✨ **Complete Explanation:**

**{best_match['title']}**

{best_match['content']}

**Key Formulas:**
{formula_text}

---
🎉 Great job working through this! Do you have any follow-up questions?""",
            "stage": "complete",
            "next_action": "new_question"
        }


# =============================================================================
# MAIN ENDPOINT
# =============================================================================

@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatRequest):
    """
    Socratic AI Tutor that guides students through progressive hints
    """
    question = request.question.strip()
    
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    # Determine current stage
    stage = request.stage or "new"
    
    # Check for stage progression keywords
    question_lower = question.lower()
    
    # Student wants full answer
    if any(phrase in question_lower for phrase in ["give me the answer", "just tell me", 
                                                     "i give up", "full explanation", "explain everything"]):
        stage = "explaining"
    # Student wants next hint
    elif any(phrase in question_lower for phrase in ["another hint", "more hint", "next hint", 
                                                       "still confused", "don't understand", "need help"]):
        stage_progression = {"new": "probing", "probing": "hint1", "hint1": "hint2", 
                            "hint2": "hint3", "hint3": "explaining"}
        stage = stage_progression.get(stage, "explaining")
    # Student seems to understand - give next hint anyway to deepen
    elif any(phrase in question_lower for phrase in ["i think", "because", "so that means", "got it"]):
        stage_progression = {"new": "probing", "probing": "hint1", "hint1": "hint2", 
                            "hint2": "hint3", "hint3": "explaining"}
        stage = stage_progression.get(stage, stage)
    
    logger.info(f"🎓 Question: {question[:50]}... | Stage: {stage}")
    
    # Search for relevant content
    relevant_content = search_knowledge_base(question)
    
    # Also search in conversation history for context
    for msg in (request.conversation_history or [])[-3:]:
        if msg.get("role") == "user":
            additional = search_knowledge_base(msg.get("content", ""))
            for item in additional:
                if item["subtopic_id"] not in [r["subtopic_id"] for r in relevant_content]:
                    item["score"] = item["score"] * 0.5  # Reduce score for historical context
                    relevant_content.append(item)
    
    relevant_content.sort(key=lambda x: x["score"], reverse=True)
    
    # If specific subtopic provided, prioritize it
    if request.subtopic and request.subtopic in KNOWLEDGE_BASE:
        content = KNOWLEDGE_BASE[request.subtopic]
        relevant_content.insert(0, {
            "subtopic_id": request.subtopic,
            "title": content["title"],
            "content": content["content"],
            "formulas": content.get("formulas", []),
            "score": 100
        })
    
    # Try Gemini first, fallback to local generation
    if model:
        try:
            result = await generate_gemini_response(question, relevant_content, 
                                                    request.conversation_history or [], stage)
        except Exception as e:
            logger.error(f"Gemini failed: {e}")
            result = generate_fallback_response(question, relevant_content, stage)
    else:
        result = generate_fallback_response(question, relevant_content, stage)
    
    # Collect sources and related topics
    sources = [f"{item['subtopic_id']}: {item['title']}" for item in relevant_content[:3]]
    related = [item['title'] for item in relevant_content[1:4]]
    
    return ChatResponse(
        answer=result["answer"],
        sources=sources,
        related_topics=related[:3],
        stage=result["stage"],
        next_action=result["next_action"]
    )


async def generate_gemini_response(question: str, relevant_content: List[Dict], 
                                   conversation_history: List[Dict], stage: str) -> Dict:
    """Use Gemini to generate a Socratic teaching response"""
    
    # Build context from relevant content
    context_parts = []
    for item in relevant_content[:2]:
        context_parts.append(f"""
Topic: {item['title']}
Content: {item['content']}
Formulas: {', '.join(item.get('formulas', []))}
""")
    context = "\n".join(context_parts)
    
    # Build conversation history
    history_text = ""
    for msg in conversation_history[-4:]:
        role = "Student" if msg.get("role") == "user" else "Tutor"
        history_text += f"{role}: {msg.get('content', '')}\n"
    
    # Stage-specific instructions
    stage_instructions = {
        "new": """This is a NEW question. Start with a PROBING QUESTION.
Ask something like "What do you think..." or "Can you recall..." 
Do NOT give the answer. Make the student think first.
Be warm and encouraging. Use 🤔 emoji.""",
        
        "probing": """The student responded to your probe. Give HINT 1.
Provide a gentle nudge toward the answer. Don't reveal everything.
Use 💡 emoji. Be encouraging about their thinking.""",
        
        "hint1": """Student needs more help. Give HINT 2.
Be more specific, maybe mention a relevant formula or concept.
Still don't give the full answer. Use 💡 emoji.""",
        
        "hint2": """Student still struggling. Give HINT 3 (final hint).
This should be very close to the answer.
Encourage them to put the pieces together. Use 💡 emoji.""",
        
        "hint3": """Time for the FULL EXPLANATION.
Provide complete answer with formulas and clear explanation.
Congratulate them for working through it! Use ✨ emoji.""",
        
        "explaining": """Give the COMPLETE EXPLANATION.
Be thorough, include formulas, and explain clearly.
Use ✨ emoji and offer to answer follow-up questions."""
    }
    
    instruction = stage_instructions.get(stage, stage_instructions["new"])
    
    prompt = f"""You are a Socratic physics tutor for quantum mechanics.

TEACHING METHOD (IMPORTANT):
1. For NEW questions: Ask a probing question, don't give answers
2. For HINTS: Give progressive hints, not full answers
3. For EXPLAINING: Give complete, clear explanations

CURRENT STAGE: {stage}
{instruction}

COURSE CONTENT:
{context}

CONVERSATION HISTORY:
{history_text}

STUDENT'S MESSAGE: {question}

Respond as a Socratic tutor. Be encouraging and use appropriate emojis.
For hints, always start with "💡 **Hint X:**"
For explanations, start with "✨ **Here's the explanation:**"
"""

    # Run Gemini API call with 10 second timeout
    loop = asyncio.get_event_loop()
    try:
        response = await asyncio.wait_for(
            loop.run_in_executor(_executor, model.generate_content, prompt),
            timeout=10.0
        )
        answer = response.text.strip()
    except asyncio.TimeoutError:
        logger.warning("⏱️ Gemini API timed out after 10s")
        raise Exception("Gemini API timeout")
    
    # Determine next stage
    next_stages = {
        "new": "probing",
        "probing": "hint1", 
        "hint1": "hint2",
        "hint2": "hint3",
        "hint3": "explaining",
        "explaining": "complete"
    }
    
    return {
        "answer": answer,
        "stage": next_stages.get(stage, "complete"),
        "next_action": "wait_for_response" if stage != "explaining" else "new_question"
    }


@router.get("/topics")
async def get_available_topics():
    """Get list of all available topics"""
    topics = {}
    for subtopic_id, content in KNOWLEDGE_BASE.items():
        chapter = subtopic_id.split('.')[0]
        if chapter not in topics:
            topics[chapter] = []
        topics[chapter].append({
            "id": subtopic_id,
            "title": content["title"]
        })
    return topics
