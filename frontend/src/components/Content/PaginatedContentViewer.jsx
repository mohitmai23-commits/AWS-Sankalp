import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Book, Brain, Activity, Clock, Video, MousePointer, Scroll, Eye, Pause, Play, Sparkles, Zap, Award, Target, TrendingUp, CheckCircle, Flame, Coffee, BookOpen, Star, Lightbulb, Heart, Rocket, MessageCircle, Volume2, PlayCircle, HelpCircle, Check, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CognitiveMonitoringService } from '../../services/cognitiveService';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Add these imports at the top
import { useProgress } from '../../context/ProgressContext';
import { getTopicNameFromKey } from '../../utils/constants';
import AudioPlayer from './AudioPlayer';
import Chatbot from './Chatbot';
import QuantumGame from '../Game/QuantumGame';

// Content Pages
const CONTENT_PAGES = {
  '1.1': {
    title: 'Introduction to Infinite Potential Well',
    pages: [
      {
        id: 1,
        heading: 'The Infinite Potential Well',
        content: `Welcome to Chapter 1! Imagine you're holding a tiny particle that's also a wave, and you trap it inside the perfect, unbreakable box. What happens next? In this chapter, you'll dive right into that scenario with the infinite potential well. Ready to see how the particle behaves when it can't ever escape? You'll explore the basic setup step by step, asking yourself: Why can't it just sit still? What forces it to vibrate in specific patterns?

Grab a pencil and sketch the box yourself, mark the walls at x=0 and x=a. Now think: How would a wave fit perfectly inside without spilling over? As you read, pause after each section and try drawing the first three wave patterns for n=1, 2, and 3. Which one has the highest "bump" in the middle? Predict where you'd most likely find the particle in each case before checking the answer.

By the end, test yourself: Can you explain to a friend why there's no "zero energy" state here? Challenge: Calculate the energy for n=1 if a=1 nm and m is an electron mass, use your phone calculator! This chapter sets the stage for everything quantum confinement. Excited? Let's bounce into those standing waves together!`
      },
    ],
    video_url: '/videos/video-1.mp4'
  },
  '1.2': {
    title: 'Concept, Assumptions and Schrödinger Equation',
    pages: [
      {
        id: 1,
        heading: 'Locked in the Quantum Box: Can Waves Obey Unbreakable Rules?',
        content: `In an infinite potential well (also called a particle in a box), a particle of mass m is confined between two rigid walls separated by a distance a along the x-axis. The potential energy V(x) is zero inside the box for`,
        formula: `0 < x < a`,
        content2: `and infinite for`,
        formula2: `x ≤ 0 and x ≥ a.`,
        content3: `Infinite potential at the walls means the particle can never exist outside this region, so the wave function must be exactly zero there. Inside the well, the particle is free in the sense that only kinetic energy contributes to the total energy, while the walls impose strict boundary conditions on the allowed wave functions. This simple system is important because it can be solved exactly and clearly demonstrates the quantization of energy.`
      },
      {
        id: 2,
        heading: 'Unlocking Wave Secrets: How Sine Waves Fight for Freedom and Energy Gets Quantized!',
        content: `To describe the particle, the time-independent Schrödinger equation in one dimension is used. Inside the well, where`,
        formula: `V(x) = 0,`,
        content2: `the equation reduces to`,
        formula2: `d²ψ/dx² + (8π²mE/h²)ψ = 0,`,
        content3: `where ψ(x) is the wave function, E is the energy, and h is Planck's constant. This is a second-order linear differential equation whose general solution is a combination of sine and cosine functions. The infinite potential barriers impose boundary conditions`,
        formula3: `ψ(0) = 0 and ψ(a) = 0,`,
        content4: `because the probability of finding the particle at or outside the walls must be zero.

Applying the boundary conditions allows only sinusoidal solutions of the form`,
        formula4: `ψₙ(x) = B sin(kx),`,
        content5: `where k is related to the energy and n is a positive integer called the quantum number. The condition`,
        formula5: `ψ(a) = 0`,
        content6: `gives`,
        formula6: `ka = nπ ⇒ k = nπ/a.`,
        content7: `Substituting this into the Schrödinger equation yields the allowed energy levels`,
        formula7: `Eₙ = n²h²/(8ma²), n = 1, 2, 3, …`,
        content8: `These discrete energies are called eigenvalues, and the corresponding wave functions are standing-wave eigenfunctions. The lowest energy state n=1 is the ground state, and higher values of n correspond to excited states.`
      },
    ],
    video_url: '/videos/video-1.mp4'
  },
  '1.3': {
    title: 'Normalization and Probability',
    pages: [
      {
        id: 1,
        heading: 'Making Waves Real: Normalize or Vanish, Where is Your Particle Hiding?',
        content: `The wave function must be normalized so that the total probability of finding the particle inside the box is one. This requirement is written as`,
        formula: `∫₀ᵃ |ψₙ(x)|² dx = 1,`,
        content2: `since the particle cannot exist outside the region 0 < x < a. Substituting`,
        formula2: `ψₙ(x) = B sin(nπx/a)`,
        content3: `into the normalization condition and evaluating the integral gives the value of the constant B. The normalized wave function is`,
        formula3: `ψₙ(x) = √(2/a) sin(nπx/a), n = 1, 2, 3, …`,
        content4: `This ensures that the probability density integrates to unity over the width of the box.`
      },
      {
        id: 2,
        heading: 'Probability Hunt: Where is Your Particle Hiding? Chase the Peaks & Dodge the Nodes!',
        content: `The probability density is given by`,
        formula: `|ψₙ(x)|²,`,
        content2: `which represents the likelihood of finding the particle near position x. For n=1, the ground-state wave function has no nodes inside the well and reaches its maximum at`,
        formula2: `x = a/2.`,
        content3: `Thus, the probability density is zero at the walls and maximum at the center. For n=2, the wave function has one node at the center, so the probability of finding the particle there is zero. Instead, there are two regions of maximum probability at`,
        formula3: `x = a/4 and x = 3a/4.`,
        content4: `For n=3, the second excited state, the wave function has two nodes and three regions of high probability. In general, the number of nodes equals n−1, and the energy increases as n². Higher-energy states therefore have more oscillations. This illustrates how confinement leads to discrete energies and structured probability distributions, unlike classical mechanics where a particle could have any energy and equal probability everywhere.`
      },
    ],
    video_url: '/videos/video-1.mp4'
  },
  '1.4': {
    title: 'Energy Eigenvalues and Quantum States',
    pages: [
      {
        id: 1,
        heading: 'Climbing the Quantum Ladder: Why Energy Jumps, Not Slides!',
        content: `The energy eigenvalues of the infinite potential well demonstrate one of the most fundamental principles of quantum mechanics: energy quantization. Unlike classical systems where energy can take any continuous value, the confined quantum particle can only exist in specific energy states given by`,
        formula: `Eₙ = n²h²/(8ma²), n = 1, 2, 3, …`,
        content2: `Notice how the energy scales with n². This means:
- The ground state (n=1) has energy E₁
- The first excited state (n=2) has energy 4E₁
- The second excited state (n=3) has energy 9E₁

The energy spacing between adjacent levels increases as we go higher:`,
        formula2: `ΔEₙ = Eₙ₊₁ - Eₙ = (2n+1)h²/(8ma²)`,
        content3: `This increasing gap means that higher energy transitions require more energy. The quantization becomes less noticeable for larger boxes (larger a) or more massive particles, which is why we don't observe quantum effects in everyday macroscopic objects.`
      },
      {
        id: 2,
        heading: 'Wave Functions: The Particle\'s Many Faces!',
        content: `Each energy level corresponds to a unique wave function that describes where the particle is likely to be found. The complete set of normalized eigenfunctions is`,
        formula: `ψₙ(x) = √(2/a) sin(nπx/a)`,
        content2: `These wave functions have several remarkable properties:

**Orthogonality**: Different eigenstates are orthogonal to each other:`,
        formula2: `∫₀ᵃ ψₘ(x)ψₙ(x) dx = 0 for m ≠ n`,
        content3: `**Completeness**: Any arbitrary wave function can be expressed as a linear combination:`,
        formula3: `Ψ(x) = Σ cₙ ψₙ(x)`,
        content4: `**Node Count**: The nth eigenfunction has exactly (n-1) nodes inside the well.

These mathematical properties reflect the physical reality that quantum states are distinct and measurable, forming the foundation for quantum measurement theory.`
      },
    ],
    video_url: '/videos/video-1.mp4'
  },
  '1.5': {
    title: 'Physical Implications of the Infinite Well',
    pages: [
      {
        id: 1,
        heading: 'Zero-Point Mystery: Why Cannot Quantum Particles Ever Sit Still?',
        content: `The infinite potential well shows that a confined particle cannot have zero energy. Even in the ground state, the energy is non-zero and is called the zero-point energy:`,
        formula: `E₁ = h²/(8ma²)`,
        content2: `If n=0 were allowed, the wave function would vanish everywhere, implying the particle does not exist, which is unphysical. This result is consistent with the Heisenberg uncertainty principle: confining a particle to a small region produces momentum uncertainty and therefore a minimum kinetic energy.

The uncertainty principle states:`,
        formula2: `ΔxΔp ≥ ℏ/2`,
        content3: `Since the particle is confined to width a, we have Δx ≈ a. This forces Δp ≥ ℏ/(2a), which means the particle must have some minimum kinetic energy even in its lowest state. This zero-point energy is a purely quantum mechanical effect with no classical analog.`
      },
      {
        id: 2,
        heading: 'From Quantum Wells to the Real World: Where Does This Matter?',
        content: `The infinite potential well model, despite its simplicity, provides crucial insights into real physical systems:

**1. Quantum Dots and Nanostructures**
Modern semiconductor devices use quantum wells to confine electrons, creating discrete energy levels that can be engineered for specific applications like lasers and LEDs.

**2. Atomic and Molecular Physics**
Electrons in atoms experience confinement by the nuclear potential, leading to quantized energy levels. The infinite well provides the conceptual foundation for understanding atomic spectra.

**3. Particle-Wave Duality**
The standing wave patterns illustrate how particles exhibit wave-like behavior when confined. The integer number of half-wavelengths that fit in the box:`,
        formula: `nλ/2 = a`,
        content2: `directly connects to the de Broglie wavelength and the wave nature of matter.

**4. Quantum Computing**
Understanding discrete quantum states in confined systems is essential for developing qubits and quantum logic gates.

The model also shows that energy levels are discrete rather than continuous, unlike classical predictions. This idea extends to electrons in atoms, molecules, and solids, where boundary conditions or periodic structures lead to quantized energy levels.

Overall, the infinite well is a foundational model illustrating energy quantization, confinement, and the probabilistic nature of quantum mechanics—principles that govern everything from microscopic particles to cutting-edge technology.`
      },
    ],
    video_url: '/videos/video-1.mp4'
  },
  '2.1': {
  title: 'Introduction to Finite Potential Well',
  pages: [
    {
      id: 1,
      heading: 'From Infinite to Finite: When Walls Can Be Crossed!',
      content: `Hey there, explorer! Chapter 2 asks: What if your unbreakable box had walls that give just a tiny bit? Welcome to the finite potential well—same idea, but now the barriers aren't infinite. Picture the particle mostly chilling inside, but with a sneaky chance to peek outside. Sound intriguing? You're about to uncover what changes when walls get "soft."

Start by drawing three regions: left barrier, central well, right barrier. Label |x| < a/2 as the cozy zone. As you go, ask: Why does the wave "fade" instead of stopping dead? Pause and imagine matching wiggly waves inside to droopy tails outside—how smooth can you make the connection? Try sketching an even (cosine) and odd (sine) pattern yourself before peeking.

Which states would you guess have lower energy than the infinite well? Why only a few bound ones? Challenge yourself: If you made the well deeper, how many patterns fit? Redraw for a shallower well—what happens to the tails? By chapter's end, quiz a study buddy: "Draw the wave and spot the leak!" This builds your intuition for real quantum traps. Ready to let some wave leak out? Dive in!`,

    },
  ],
  video_url: 'https://www.youtube.com/embed/example'
},
'2.2': {
  title: 'Definition and Regions of Finite Potential Well',
  pages: [
    {
      id: 1,
      heading: 'Goodbye Infinite Walls: Meet the Leaky Quantum Trap!',
      content: `A finite potential well is similar to the infinite well, but the walls now have finite height instead of being infinitely high. This makes the model far more realistic.

In a finite square well, the potential energy is negative inside the well and zero outside. Mathematically, the potential is defined as`,
      formula: `V(x) = −V₀  for  |x| < a/2`,
      content2: `and`,
      formula2: `V(x) = 0  for  |x| > a/2,`,
      content3: `where V₀ > 0 represents the depth of the potential well.

Bound states occur when the particle’s energy lies in the range`,
      formula3: `−V₀ < E < 0.`,
      content4: `In this range, the particle is mainly localized inside the well but has a non-zero probability of being found outside due to quantum tunnelling. Because the potential is symmetric about x = 0, the wave functions can be chosen to be either even or odd.`
    },
    {
      id: 2,
      heading: '3-Zone Wave Party: Wiggles Inside, Fading Tails Outside!',
      content: `To solve the Schrödinger equation for a finite potential well, the space is divided into three distinct regions:`,

      content2: `**Region I:**`,
      formula2: `x < −a/2`,

      content3: `**Region II:**`,
      formula3: `−a/2 < x < a/2`,

      content4: `**Region III:**`,
      formula4: `x > a/2`,

      content5: `In Region II, where`,
      formula5: `V(x) = −V₀,`,
      content6: `the solutions of the Schrödinger equation are oscillatory and take the form`,
      formula6: `ψⅡ(x) = A cos(kx)  or  A sin(kx).`,

      content7: `In Regions I and III, where the particle’s energy is less than the potential energy,`,
      formula7: `E < V(x),`,
      content8: `the solutions are not oscillatory but decay exponentially, reflecting the decreasing probability of finding the particle as we move away from the well.`
    }
  ],
  video_url: 'https://www.youtube.com/embed/example'},
  '2.3': {
  title: 'Bound States and Transcendental Equations',
  pages: [
    {
      id: 1,
      heading: 'Tail Matching Mayhem: Cos vs Sin – Solve the Forbidden Puzzle!',
      content: `In Regions I and III, where the potential energy is higher than the particle’s energy, the wave functions decay exponentially.

The solutions are given by`,
      formula: `ψⅠ(x) = C e^{αx},   x < −a/2`,
      content2: `and`,
      formula2: `ψⅢ(x) = D e^{−αx},   x > a/2,`,

      content3: `where`,
      formula3: `α = √[2m(V₀ − |E|)] / ℏ.`,

      content4: `Diverging exponential terms are discarded because the wave function must remain normalizable.

The wave function ψ and its derivative dψ/dx must be continuous at`,
      formula4: `x = ±a/2.`,

      content5: `Applying these boundary conditions leads to transcendental equations.

For **even states**,`,
      formula5: `α = k tan(ka/2),`,

      content6: `and for **odd states**,`,
      formula6: `α = −k cot(ka/2).`,

      content7: `Since both k and α depend on energy, these equations cannot be solved analytically and must be solved numerically or graphically to determine the allowed energy levels.`
    }
  ],
  video_url: 'https://www.youtube.com/embed/example'},
  '2.4': {
  title: 'Energy Levels in a Finite Potential Well',
  pages: [
    {
      id: 1,
      heading: 'Infinite vs Finite Smackdown: Why Real Traps Always Leak!',
      content: `In a finite potential well, the allowed energy levels are lower than those in an infinite well of the same width. This happens because the wave function is not strictly confined to the region`,
      formula: `|x| < a/2;`,
      content2: `instead, it extends into the barrier regions as exponentially decaying tails.

This effective increase in the spatial extent of the wave function reduces its curvature, which in turn lowers its kinetic energy. As a result, the energy eigenvalues are smaller than the corresponding levels in an infinite well.

Another key difference is that only a **finite number of bound states** can exist in a finite well. For higher energies, the particle is no longer localized, and the states merge into a continuum. In contrast, the infinite well supports bound states for all positive integers n.`,

      content3: `The presence of wave-function tails outside the well enables **quantum tunnelling**, where the particle has a finite probability of being found in classically forbidden regions. This is impossible in the infinite well, where the wave function is forced to be exactly zero at and beyond the walls.

Because of this, the finite potential well is a far more realistic model for physical systems such as semiconductor quantum wells and nuclear potentials, where finite forces bind particles and tunnelling plays a crucial role in determining observable properties.`
    }
  ],
  video_url: 'https://www.youtube.com/embed/example'},
  '3.1': {
  title: 'Introduction to Quantum Tunnelling',
  pages: [
    {
      id: 1,
      heading: 'How Particles Cross the Impossible',
      content: `Chapter 3 introduces one of the most surprising predictions of quantum mechanics: tunnelling. In classical physics, a particle cannot cross a potential barrier unless it has enough energy to climb over it. Quantum mechanics breaks this rule. Even when a particle’s energy is lower than the height of a barrier, there is still a finite probability that it can pass through. This phenomenon is known as quantum tunnelling and represents a complete departure from classical intuition.

To build intuition, imagine a particle approaching a tall, thin wall. As it reaches the barrier, its wave function does not abruptly stop. Instead, it decays exponentially inside the barrier and may reappear on the other side. The likelihood of tunnelling depends strongly on the height and thickness of the barrier: taller or wider barriers suppress tunnelling more effectively, while thinner barriers allow a higher probability of transmission. This explains why extremely thin gaps can be crossed relatively easily at the quantum scale.

Quantum tunnelling is not just a theoretical curiosity. It plays a crucial role in real physical systems, such as alpha decay in nuclear physics, scanning tunnelling microscopes, and modern semiconductor devices. Understanding tunnelling helps explain how particles escape confined regions and how quantum effects dominate behavior at microscopic scales, marking a key transition from bound systems to transport phenomena.`
    }
  ],
  video_url: 'https://www.youtube.com/embed/example'},
  '3.2': {
  title: 'Tunnelling from the Finite Potential Well',
  pages: [
    {
      id: 1,
      heading: 'How Bound Particles Escape Their Wells',
      content: `Quantum tunnelling occurs when a particle is found in a region where its total energy is less than the potential energy,`,
      formula: `E < V(x).`,
      content2: `In the case of a finite potential well, this situation arises outside the well boundaries, where the potential energy exceeds the particle’s energy. Instead of vanishing abruptly at the edges, the wave function decays exponentially into the barrier regions. Although the probability of finding the particle outside the well is small, it is not zero, allowing the particle to partially penetrate or even pass through the barrier.`,
      content3: `The tunnelling probability depends on several factors, most importantly the height and width of the potential barrier and the energy of the particle. A higher or wider barrier leads to stronger exponential decay and therefore a smaller tunnelling probability, while a thinner or lower barrier increases the likelihood of tunnelling. As the particle energy approaches the barrier height, the decay becomes weaker and tunnelling becomes more significant.`,
      content4: `In the limiting case where the barrier height becomes infinite, the wave function is forced to vanish completely at the boundaries and outside the well. In this limit, tunnelling is no longer possible and the system reduces to the infinite potential well. Thus, tunnelling from a finite well highlights the essential difference between idealized infinite confinement and realistic physical systems, where barriers are always finite and quantum leakage plays a crucial role.`
    }
  ],
  video_url: 'https://www.youtube.com/embed/example'},
  '3.3': {
  title: 'Energies and Continuous Spectrum',
  pages: [
    {
      id: 1,
      heading: 'When Bound States Give Way to Free Motion',
      content: `When the particle energy exceeds the height of the potential barrier, the particle is no longer confined to the well and becomes unbound. This regime is characterized by the condition`,
      formula: `E > V₀.`,
      content2: `In this case, the energy spectrum is no longer discrete but continuous, meaning the particle can possess any energy above the barrier. The corresponding wave function is oscillatory in all regions of space, both inside and outside the well, reflecting the fact that the particle is free to propagate.`,
      content3: `Even though the particle is unbound, partial reflection and transmission still occur at the potential boundaries due to wave interference. As the wave passes through the well and the surrounding regions, constructive and destructive interference can lead to resonance effects, where transmission is enhanced at certain energies.`,
      content4: `In single-barrier tunnelling problems, the wave function decays exponentially inside the barrier when the particle energy is below the barrier height and becomes oscillatory again beyond it. This wave-like behavior leads to a finite transmission probability even in situations where classical physics predicts zero transmission. The existence of a continuous energy spectrum above the barrier highlights the transition from bound quantum states to scattering states and plays a key role in understanding transport phenomena in quantum systems.`
    }
  ],
  video_url: 'https://www.youtube.com/embed/example'},
  '3.4': {
  title: 'Applications of Quantum Tunnelling',
  pages: [
    {
      id: 1,
      heading: 'From Nuclear Decay to Nanotechnology',
      content: `Quantum tunnelling provides a fundamental explanation for several important physical phenomena that cannot be understood using classical physics alone. One of the earliest and most striking examples is alpha decay, in which alpha particles escape from atomic nuclei by tunnelling through the nuclear potential barrier. Classically, these particles do not possess enough energy to overcome the barrier, yet tunnelling allows a finite probability of escape, accurately explaining observed decay rates.`,
      content2: `Tunnelling is also the operating principle behind the scanning tunnelling microscope (STM), a powerful instrument capable of imaging surfaces at the atomic scale. In an STM, electrons tunnel between a sharp metallic tip and a conducting surface when they are brought extremely close together. The tunnelling current depends sensitively on the distance between the tip and the surface, enabling precise measurements of atomic structures.`,
      content3: `In modern electronics, quantum tunnelling plays a crucial role in devices such as tunnel diodes, where it leads to unique current–voltage characteristics, and in nanoscale transistors, where electron tunnelling affects performance and sets fundamental limits on miniaturization. Tunnelling also influences chemical reactions and molecular bonding, particularly in processes involving light particles such as electrons and protons. Simple potential well and barrier models capture the essential physics of tunnelling and provide deep insight into these diverse applications, forming a cornerstone of quantum mechanics and its technological impact.`
    }
  ],
  video_url: 'https://www.youtube.com/embed/example'
},
};

// Inline Animation Component - LARGER VERSION
const InfiniteWellAnimation = () => {
  const [n, setN] = useState(1);
  const [showProbability, setShowProbability] = useState(false);
  const [energy, setEnergy] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setEnergy(n * n);
  }, [n]);

  const generateWavePath = useCallback((nVal, width, height) => {
    const L = 1;
    const samples = 200;
    const points = [];
    
    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * L;
      const psi = Math.sin(nVal * Math.PI * x);
      const px = (x / L) * width;
      const py = height / 2 + psi * (height * 0.35);
      points.push(`${px},${py}`);
    }
    return `M ${points.join(' L')}`;
  }, []);

  const wavePath = generateWavePath(n, 500, 280);

  const handleNChange = (newN) => {
    setIsAnimating(true);
    setN(newN);
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <div style={{
      padding: '2rem',
      fontFamily: "'Patrick Hand', cursive",
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Title */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          fontSize: '1.6rem',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}
      >
        🎸 Infinite Well = Guitar String! 🎸
      </motion.h2>

      {/* Analogy */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          borderLeft: '5px solid #3b82f6',
          marginBottom: '2rem',
          fontSize: '1.5rem',
          lineHeight: '1.6'
        }}
      >
        <strong>Analogy:</strong> The electron is like a guitar string tied between two 
        immovable walls. It can only vibrate in special "standing wave" patterns!
      </motion.p>

      {/* Visualization - LARGER */}
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '1.5rem', 
        marginBottom: '2rem',
        justifyContent: 'center'
      }}>
        <svg width="100%" height="300" viewBox="0 0 550 300" style={{ maxWidth: '550px' }}>
          {/* Walls */}
          <motion.line x1="35" y1="10" x2="35" y2="280" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
          <motion.line x1="515" y1="10" x2="515" y2="280" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />

          {/* Wavefunction */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`${n}-${showProbability}`}
              d={wavePath}
              fill="none"
              stroke={showProbability ? '#f59e0b' : '#3b82f6'}
              strokeWidth={4}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 1,
                strokeDashoffset: isAnimating ? [0, 100] : 0,
              }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{
                pathLength: { duration: 0.8, ease: "easeOut" },
                opacity: { duration: 0.3 },
              }}
            />
          </AnimatePresence>

          {/* Probability fill */}
          {showProbability && (
            <motion.path
              d={wavePath}
              fill="#fbbf24"
              fillOpacity="0.4"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          <text x="275" y="30" textAnchor="middle" fontSize="16" fill="#6b7280" fontWeight="600">
            Perfect Prison: ψ=0 at walls! 🚫
          </text>
        </svg>

        {/* Energy Bar - LARGER */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: energy / 36 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{
            width: '80px',
            height: '200px',
            background: 'linear-gradient(to top, #10b981, #059669)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0.75rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            transformOrigin: 'bottom'
          }}
        >
          <span>E = {energy}×</span>
        </motion.div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', margin: '2rem 0' }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <label style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1f2937', display: 'block', marginBottom: '0.75rem' }}>
            🎵 Pluck pattern (n):
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5, 6].map((val) => (
              <motion.button
                key={val}
                onClick={() => handleNChange(val)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: n === val ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#f1f5f9',
                  color: n === val ? 'white' : '#475569',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: n === val ? '0 8px 20px rgba(59, 130, 246, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  fontSize: '1rem'
                }}
              >
                n={val}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={() => setShowProbability(!showProbability)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #fda4af, #fb7185)',
            color: '#881337',
            border: '2px solid #f43f5e',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(251, 113, 133, 0.3)'
          }}
        >
          {showProbability ? 'Show Wavefunction' : 'Show Probability |ψ|²'}
        </motion.button>
      </div>

      {/* Learning Points */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #e5e7eb'
        }}
      >
        <h3 style={{ color: '#43987dff', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>⚡ Key Learnings:</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{
            padding: '0.75rem 0',
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            marginBottom: '0.5rem',
            background: '#f8fafc',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.95rem'
          }}>
            <strong>n=1:</strong> Smooth bump, max probability at center!
          </li>
          <li style={{
            padding: '0.75rem 0',
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            marginBottom: '0.5rem',
            background: '#f8fafc',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.95rem'
          }}>
            <strong>Higher n:</strong> More wiggles = more nodes = higher energy!
          </li>
          <li style={{
            padding: '0.75rem 0',
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            marginBottom: '0.5rem',
            background: '#f8fafc',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.95rem'
          }}>
            <strong>Walls:</strong> Wave ALWAYS zero there 🚫
          </li>
          <li style={{
            padding: '0.75rem 0',
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem',
            background: '#f8fafc',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.95rem'
          }}>
            <strong>Energy:</strong> Grows like n² (quadratic!)
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

// ============ FINITE WELL ANIMATION ============
const FiniteWellAnimation = () => {
  const [n, setN] = useState(1);
  const [wallHeight, setWallHeight] = useState(7);
  const [showProbability, setShowProbability] = useState(false);

  const WIDTH = 500;
  const HEIGHT = 280;

  const tailStrength = wallHeight / 2;

  const buildFiniteWellPath = useCallback((nVal, tailStr) => {
    const samples = 220;
    const points = [];
    const wellStart = 0.2;
    const wellEnd = 0.8;
    const wellWidth = wellEnd - wellStart;

    for (let i = 0; i <= samples; i++) {
      const xNorm = i / samples;
      let psi = 0;

      if (xNorm < wellStart) {
        const dist = (wellStart - xNorm) / wellStart;
        psi = Math.exp(-tailStr * dist);
        const phase = Math.sin(nVal * Math.PI * 0);
        psi *= phase >= 0 ? 1 : -1;
      } else if (xNorm > wellEnd) {
        const dist = (xNorm - wellEnd) / (1 - wellEnd);
        psi = Math.exp(-tailStr * dist);
        const phase = Math.sin(nVal * Math.PI * 1);
        psi *= phase >= 0 ? 1 : -1;
      } else {
        const xLocal = (xNorm - wellStart) / wellWidth;
        psi = Math.sin(nVal * Math.PI * xLocal);
      }

      const xPx = 40 + xNorm * (WIDTH - 80);
      const yPx = HEIGHT / 2 - psi * (HEIGHT * 0.3);
      points.push(`${xPx},${yPx}`);
    }

    return "M " + points.join(" L ");
  }, [WIDTH, HEIGHT]);

  const wavePath = buildFiniteWellPath(n, tailStrength);

  return (
    <div style={{
      padding: '1.5rem',
      fontFamily: "'Patrick Hand', cursive",
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      height: '100%',
      overflowY: 'auto'
    }}>
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          fontSize: '1.5rem',
          background: 'linear-gradient(135deg, #0f766e, #0ea5e9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}
      >
        Finite Well – Soft Walls & Leaking Waves
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          borderLeft: '5px solid #0f766e',
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}
      >
        <strong>Analogy:</strong> Think of a swimming pool with sand banks instead of concrete walls. 
        Inside, water forms standing waves, but near the edges, some water seeps into the sand!
      </motion.p>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {/* Left barrier */}
          <rect x={40} y={HEIGHT * 0.2} width={(WIDTH - 80) * 0.2} height={HEIGHT * 0.6} fill="#e5e7eb" stroke="#9ca3af" strokeWidth={1} />
          {/* Right barrier */}
          <rect x={40 + (WIDTH - 80) * 0.8} y={HEIGHT * 0.2} width={(WIDTH - 80) * 0.2} height={HEIGHT * 0.6} fill="#e5e7eb" stroke="#9ca3af" strokeWidth={1} />
          {/* Well bottom */}
          <rect x={40 + (WIDTH - 80) * 0.2} y={HEIGHT * 0.55} width={(WIDTH - 80) * 0.6} height={2} fill="#9ca3af" />

          {/* Labels */}
          <text x={WIDTH * 0.12} y={HEIGHT * 0.15} fontSize={11} fill="#4b5563">Barrier (V₀)</text>
          <text x={WIDTH * 0.42} y={HEIGHT * 0.15} fontSize={11} fill="#4b5563">Inside Well (V=0)</text>

          {/* Wavefunction */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`${n}-${showProbability}-${wallHeight}`}
              d={wavePath}
              fill="none"
              stroke={showProbability ? '#f59e0b' : '#2563eb'}
              strokeWidth={3}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ pathLength: { duration: 0.7, ease: "easeOut" }, opacity: { duration: 0.3 } }}
            />
          </AnimatePresence>

          {showProbability && (
            <motion.path d={wavePath} fill="#fbbf24" fillOpacity={0.3} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 0.4 }} />
          )}
        </svg>

        {/* Leakage indicator */}
        <div style={{ width: '140px', fontSize: '0.85rem', color: '#374151', background: 'white', padding: '1rem', borderRadius: '12px' }}>
          <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Tunneling tendency</span>
          <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #22c55e, #eab308)', borderRadius: '999px', width: `${(12 - wallHeight) * 10}%`, transition: 'width 0.3s ease' }} />
          </div>
          <small>Lower walls → longer tails</small>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <label style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1f2937', display: 'block', marginBottom: '0.5rem' }}>Mode (n):</label>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {[1, 2, 3].map((val) => (
              <motion.button
                key={val}
                onClick={() => setN(val)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: n === val ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : '#e5e7eb',
                  color: n === val ? 'white' : '#374151',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: n === val ? '0 8px 20px rgba(37, 99, 235, 0.4)' : 'none'
                }}
              >
                n={val}
              </motion.button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', width: '80%' }}>
          <label style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1f2937', display: 'block', marginBottom: '0.5rem' }}>Wall height (V₀): {wallHeight}</label>
          <input
            type="range"
            min={3}
            max={12}
            value={wallHeight}
            onChange={(e) => setWallHeight(Number(e.target.value))}
            style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#d1d5db' }}
          />
        </div>

        <motion.button
          onClick={() => setShowProbability(!showProbability)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #fda4af, #fb7185)',
            color: '#881337',
            border: '2px solid #f43f5e',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(251, 113, 133, 0.3)'
          }}
        >
          {showProbability ? 'Show Wave ψ(x)' : 'Show Probability |ψ(x)|²'}
        </motion.button>
      </div>

      {/* Learning points */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ marginBottom: '0.75rem', color: '#0f766e', fontSize: '1.1rem', fontWeight: 'bold' }}>Key Insights:</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ padding: '0.5rem 0.75rem', marginBottom: '0.4rem', background: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #0ea5e9', fontSize: '0.9rem' }}>
            <strong>Inside:</strong> Standing wave, like the infinite well
          </li>
          <li style={{ padding: '0.5rem 0.75rem', marginBottom: '0.4rem', background: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #0ea5e9', fontSize: '0.9rem' }}>
            <strong>Outside:</strong> Wave doesn't drop to zero – it fades (exponential tails)
          </li>
          <li style={{ padding: '0.5rem 0.75rem', marginBottom: '0.4rem', background: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #0ea5e9', fontSize: '0.9rem' }}>
            <strong>Higher V₀:</strong> Tails shrink – behaves more like infinite well
          </li>
          <li style={{ padding: '0.5rem 0.75rem', background: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #0ea5e9', fontSize: '0.9rem' }}>
            <strong>Lower V₀:</strong> Tails grow – more "leak" outside = tunneling!
          </li>
        </ul>
      </div>
    </div>
  );
};

// ============ TUNNELING ANIMATION ============
const TunnelingAnimation = () => {
  const [barrierWidth, setBarrierWidth] = useState(0.2);
  const [barrierHeight, setBarrierHeight] = useState(6);
  const [showProbability, setShowProbability] = useState(false);
  const [showTransmitted, setShowTransmitted] = useState(true);

  const WIDTH = 500;
  const HEIGHT = 280;

  const buildTunnelingPath = useCallback((bWidth, bHeight, showTrans) => {
    const samples = 300;
    const points = [];
    const leftWellEnd = 0.25;
    const barrierStart = 0.35;
    const barrierEnd = barrierStart + bWidth;
    const rightWellStart = barrierEnd + 0.05;

    for (let i = 0; i <= samples; i++) {
      const xNorm = i / samples;
      let psi = 0;

      if (xNorm < leftWellEnd) {
        const xLocal = xNorm / leftWellEnd;
        psi = Math.sin(3 * Math.PI * xLocal);
      } else if (xNorm >= barrierStart && xNorm <= barrierEnd) {
        const distFromCenter = Math.min(xNorm - barrierStart, barrierEnd - xNorm) / bWidth;
        psi = 0.8 * Math.exp(-6 * (0.5 - distFromCenter));
        psi *= Math.exp(-bHeight / 5);
      } else if (xNorm > rightWellStart) {
        const xLocal = (xNorm - rightWellStart) / (1 - rightWellStart);
        psi = showTrans ? 0.3 * Math.sin(3 * Math.PI * xLocal) : 0;
      } else {
        psi = 0.1;
      }

      const xPx = 30 + xNorm * (WIDTH - 60);
      const yPx = HEIGHT / 2 - psi * (HEIGHT * 0.35);
      points.push(`${xPx},${yPx}`);
    }

    return "M " + points.join(" L ");
  }, [WIDTH, HEIGHT]);

  const tunnelingPath = buildTunnelingPath(barrierWidth, barrierHeight, showTransmitted);
  const transmissionProb = Math.max(0, (1 - barrierWidth) * (1 - barrierHeight / 12)) * 100;

  return (
    <div style={{
      padding: '1.5rem',
      fontFamily: "'Patrick Hand', cursive",
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.2)',
      height: '100%',
      overflowY: 'auto'
    }}>
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          fontSize: '1.5rem',
          background: 'linear-gradient(135deg, #dc2626, #ea580c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}
      >
        Quantum Tunneling – The Impossible Escape!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '1rem',
          borderRadius: '12px',
          borderLeft: '5px solid #dc2626',
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}
      >
        <strong>Analogy:</strong> A marble rolling toward a hill it can't climb. Classically? Bounces back. 
        Quantum mechanically? There's a tiny chance it appears on the other side!
      </motion.p>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {/* Left well */}
          <rect x={40} y={HEIGHT * 0.2} width={WIDTH * 0.2} height={HEIGHT * 0.6} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1} />
          {/* Barrier */}
          <rect
            x={40 + WIDTH * 0.3}
            y={HEIGHT * (0.2 - barrierHeight / 60)}
            width={WIDTH * barrierWidth}
            height={HEIGHT * (0.6 + barrierHeight / 30)}
            fill="#fed7aa"
            stroke="#f97316"
            strokeWidth={2}
          />
          {/* Right well */}
          <rect x={40 + WIDTH * 0.65} y={HEIGHT * 0.2} width={WIDTH * 0.25} height={HEIGHT * 0.6} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1} />

          {/* Wavefunction */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`${barrierWidth}-${barrierHeight}-${showProbability}-${showTransmitted}`}
              d={tunnelingPath}
              fill="none"
              stroke={showProbability ? '#ea580c' : '#7c3aed'}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ pathLength: { duration: 0.8, ease: "easeOut" }, opacity: { duration: 0.3 } }}
            />
          </AnimatePresence>

          {showProbability && (
            <motion.path d={tunnelingPath} fill="#f97316" fillOpacity={0.25} initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ duration: 0.4 }} />
          )}

          {/* Labels */}
          <text x={WIDTH * 0.1} y={HEIGHT * 0.12} fontSize={11} fill="#1e40af">Left Well</text>
          <text x={WIDTH * 0.42} y={HEIGHT * 0.08} fontSize={12} fill="#dc2626" fontWeight="bold">Barrier</text>
          <text x={WIDTH * 0.72} y={HEIGHT * 0.12} fontSize={11} fill="#1e40af">Right Well</text>
        </svg>

        {/* Transmission meter */}
        <div style={{ width: '140px', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937', display: 'block', marginBottom: '0.75rem' }}>Transmission</span>
          <div style={{ position: 'relative', height: '16px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${transmissionProb}%` }}
              transition={{ duration: 0.5 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: '8px' }}
            />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#059669' }}>{transmissionProb.toFixed(0)}%</span>
          <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>Thinner barrier = more tunneling</small>
        </div>
      </div>

      {/* Controls */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Barrier Width</label>
            <input
              type="range"
              min={0.08}
              max={0.35}
              step={0.01}
              value={barrierWidth}
              onChange={(e) => setBarrierWidth(Number(e.target.value))}
              style={{ width: '100%', height: '6px', borderRadius: '3px' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{(barrierWidth * 100).toFixed(0)}%</span>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Barrier Height</label>
            <input
              type="range"
              min={2}
              max={10}
              step={0.5}
              value={barrierHeight}
              onChange={(e) => setBarrierHeight(Number(e.target.value))}
              style={{ width: '100%', height: '6px', borderRadius: '3px' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{barrierHeight.toFixed(1)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            onClick={() => setShowTransmitted(!showTransmitted)}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '999px',
              border: '2px solid #eab308',
              background: showTransmitted ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'white',
              color: showTransmitted ? 'white' : '#92400e',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {showTransmitted ? 'Transmitted Wave ON' : 'Transmitted Wave OFF'}
          </motion.button>

          <motion.button
            onClick={() => setShowProbability(!showProbability)}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '999px',
              border: '2px solid #f43f5e',
              background: 'linear-gradient(135deg, #fda4af, #fb7185)',
              color: '#881337',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {showProbability ? 'Show Wavefunction' : 'Show Probability'}
          </motion.button>
        </div>
      </div>

      {/* Learning points */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px' }}>
        <h3 style={{ color: '#dc2626', marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Tunneling Visualized:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #f97316', fontSize: '0.85rem' }}>
            <strong>Left well:</strong> Electron starts here (big wave)
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #f97316', fontSize: '0.85rem' }}>
            <strong>Barrier:</strong> Wave decays exponentially (forbidden!)
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #f97316', fontSize: '0.85rem' }}>
            <strong>Right well:</strong> Small transmitted wave = tunneling!
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #f97316', fontSize: '0.85rem' }}>
            <strong>Meter:</strong> Real transmission probability
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ ANIMATION SELECTOR ============
const getAnimationForSubtopic = (subtopic) => {
  if (!subtopic) return <InfiniteWellAnimation />;
  
  const chapter = subtopic.charAt(0);
  
  switch(chapter) {
    case '1':
      return <InfiniteWellAnimation />;
    case '2':
      return <FiniteWellAnimation />;
    case '3':
      return <TunnelingAnimation />;
    default:
      return <InfiniteWellAnimation />;
  }
};

export default function PaginatedContentViewer({ topic, subtopic }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProgress } = useProgress(); 
  
  const [currentPage, setCurrentPage] = useState(0);
  const [cognitiveLoad, setCognitiveLoad] = useState(0.35);
  const [cognitiveLoadLabel, setCognitiveLoadLabel] = useState('MEASURING');
  const [confidence, setConfidence] = useState(0);
  const [engagementLevel, setEngagementLevel] = useState(0);
  const [showCamera, setShowCamera] = useState(true);
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Modal states for Audio, Video, Chatbot, Game
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const [computedMetrics, setComputedMetrics] = useState({
    scrollSpeed: 0,
    scrollDepth: 0,
    backForthScrolls: 0,
    hoverDurationAvg: 0,
    mouseErratic: 0,
    pauseDuration: 0
  });
  
  const [pageMetrics, setPageMetrics] = useState({
    timeOnPage: 0,
    scrollEvents: 0,
    mouseMovements: 0,
    hoverTime: 0
  });

  const pageStartTime = useRef(Date.now());
  const checkCount = useRef(0);
  const latestEngagement = useRef(0);
  const latestMetrics = useRef(pageMetrics);
  const highLoadStreak = useRef(0);
  const videoRef = useRef(null);
  const cognitiveServiceRef = useRef(null);
  const modalVideoRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const pauseStartTimeRef = useRef(null);

  const content = CONTENT_PAGES[subtopic];
  const totalPages = content?.pages?.length || 0;
  const currentPageData = content?.pages[currentPage];

  // Convert topic URL key to proper topic name for database
  const topicName = getTopicNameFromKey(topic);

  useEffect(() => {
    latestEngagement.current = engagementLevel;
  }, [engagementLevel]);

  useEffect(() => {
    if (user && topicName && subtopic) {
      // Mark as accessed (not completed yet)
      updateProgress(topicName, subtopic, false);
    }
  }, [user, topicName, subtopic]);

  useEffect(() => {
    if (currentPage === totalPages - 1 && !isCompleted) {
      // User reached the last page
      const timer = setTimeout(() => {
        setIsCompleted(true);
        if (user && topicName && subtopic) {
          updateProgress(topicName, subtopic, true);
          console.log('✅ Subtopic marked as completed!');
        }
      }, 3000); // Mark complete after 3 seconds on last page

      return () => clearTimeout(timer);
    }
  }, [currentPage, totalPages, isCompleted, user, topicName, subtopic]);


  useEffect(() => {
    latestMetrics.current = pageMetrics;
  }, [pageMetrics]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 160, height: 120 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        setShowCamera(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const userId = user?.user_id || localStorage.getItem('user_id') || 'default-user';
    const cognitiveService = new CognitiveMonitoringService(userId);
    cognitiveServiceRef.current = cognitiveService;
    
    cognitiveService.connect((data) => {
      if (!isPaused) {
        const rawEngagement = data.engagementLevel;
        const noise = (Math.random() - 0.5) * 0.15;
        const realisticEngagement = Math.max(0.3, Math.min(1.0, rawEngagement + noise));
        setEngagementLevel(realisticEngagement);
      }
    });

    return () => {
      cognitiveService.disconnect();
    };
  }, [user, isPaused]);

  useEffect(() => {
    pageStartTime.current = Date.now();
    pausedTimeRef.current = 0;
    setPageMetrics({ timeOnPage: 0, scrollEvents: 0, mouseMovements: 0, hoverTime: 0 });
    highLoadStreak.current = 0;
    checkCount.current = 0;
    setCognitiveLoadLabel('MEASURING');
    setConfidence(0);
    setCognitiveLoad(prev => prev * 0.7 + 0.35 * 0.3);

    const timer = setInterval(() => {
      if (!isPaused) {
        const totalElapsed = Date.now() - pageStartTime.current;
        const activeTime = (totalElapsed - pausedTimeRef.current) / 1000;
        setPageMetrics(prev => ({ ...prev, timeOnPage: activeTime }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPage, isPaused]);

  useEffect(() => {
    let movementCount = 0;
    let hoverStart = null;
    let totalHover = 0;

    const handleMouseMove = () => {
      if (isPaused) return;
      movementCount++;
      setPageMetrics(prev => ({ ...prev, mouseMovements: movementCount }));
    };

    const handleMouseEnter = () => {
      if (isPaused) return;
      hoverStart = Date.now();
    };

    const handleMouseLeave = () => {
      if (isPaused || !hoverStart) return;
      totalHover += Date.now() - hoverStart;
      setPageMetrics(prev => ({ ...prev, hoverTime: totalHover / 1000 }));
      hoverStart = null;
    };

    const handleScroll = () => {
      if (isPaused) return;
      setPageMetrics(prev => ({ ...prev, scrollEvents: prev.scrollEvents + 1 }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage, isPaused]);

  const checkCognitiveLoad = useCallback(async () => {
    if (!user || isPaused) return;

    const metrics = latestMetrics.current;
    const currentEngagement = latestEngagement.current;

    if (metrics.timeOnPage < 8) {
      console.log(`⏳ Collecting data... (${metrics.timeOnPage.toFixed(1)}s / 8s minimum)`);
      return;
    }

    checkCount.current++;

    try {
      const timeSpent = metrics.timeOnPage;
      const scrollSpeed = metrics.scrollEvents / Math.max(timeSpent, 1) * 100;
      const mouseActivity = metrics.mouseMovements / Math.max(timeSpent, 1);
      const scrollDepth = Math.min(metrics.scrollEvents / 5, 1.0);
      const backForthScrolls = Math.floor(metrics.scrollEvents / 2);
      const hoverDurationAvg = metrics.hoverTime / Math.max(metrics.mouseMovements, 1) || 3;
      const mouseErratic = mouseActivity > 5 ? 0.7 : mouseActivity > 2 ? 0.4 : 0.2;
      
      setComputedMetrics({
        scrollSpeed,
        scrollDepth,
        backForthScrolls,
        hoverDurationAvg,
        mouseErratic,
        pauseDuration: 0
      });
      
      const payload = {
        user_id: user.user_id,
        subtopic_id: `${subtopic}-page-${currentPage + 1}`,
        engagement_score: currentEngagement,
        scroll_speed: scrollSpeed,
        scroll_depth: scrollDepth,
        back_forth_scrolls: backForthScrolls,
        hover_duration_avg: hoverDurationAvg,
        time_spent: timeSpent,
        mouse_movement_erratic: mouseErratic,
        pause_duration: 0
      };

      console.log(`\n📊 Check #${checkCount.current} | Page ${currentPage + 1}/${totalPages}`);

      const response = await api.checkCognitiveLoad(payload);
      
      const loadLabel = response.data.cognitive_load;
      const loadScore = response.data.cognitive_load_score;
      const newConfidence = response.data.confidence || 0;
      
      console.log(`   Result: ${loadLabel} | Score: ${(loadScore * 100).toFixed(1)}% | Conf: ${(newConfidence * 100).toFixed(1)}%`);
      
      setConfidence(newConfidence);
      
      if (newConfidence > 0.4) {
        setCognitiveLoad(prev => {
          const alpha = newConfidence > 0.7 ? 0.25 : 0.15;
          const smoothed = alpha * loadScore + (1 - alpha) * prev;
          
          const maxChange = 0.15;
          const change = smoothed - prev;
          const constrainedChange = Math.max(-maxChange, Math.min(maxChange, change));
          const result = prev + constrainedChange;
          
          console.log(`   Smoothed: ${(prev * 100).toFixed(1)}% → ${(result * 100).toFixed(1)}%`);
          return result;
        });
        
        setCognitiveLoadLabel(loadLabel);

        if (loadLabel === 'HIGH' && loadScore > 0.75 && newConfidence > 0.6) {
          highLoadStreak.current++;
          console.log(`   ⚠️ HIGH load streak: ${highLoadStreak.current}/3`);
        } else {
          highLoadStreak.current = 0;
        }

        if (highLoadStreak.current >= 3) {
          console.log('   🚨 SUSTAINED HIGH COGNITIVE LOAD - Redirecting!');
          setTimeout(() => {
            navigate(`/physics/${topic}/${subtopic}/simplified`);
          }, 1500);
        }
      }
      
    } catch (error) {
      console.error('❌ Cognitive check failed:', error);
    }
  }, [user, currentPage, topic, subtopic, totalPages, navigate, isPaused]);

  useEffect(() => {
    const interval = setInterval(checkCognitiveLoad, 5000);
    return () => clearInterval(interval);
  }, [checkCognitiveLoad]);

  const togglePause = () => {
    if (isPaused) {
      if (pauseStartTimeRef.current) {
        const pauseDuration = Date.now() - pauseStartTimeRef.current;
        pausedTimeRef.current += pauseDuration;
        pauseStartTimeRef.current = null;
      }
      console.log('▶️ Monitoring RESUMED');
    } else {
      pauseStartTimeRef.current = Date.now();
      console.log('⏸️ Monitoring PAUSED');
    }
    setIsPaused(!isPaused);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      // On last page, mark as complete immediately when clicking next
      if (!isCompleted && user && topicName && subtopic) {
        setIsCompleted(true);
        updateProgress(topicName, subtopic, true);
        console.log('✅ Subtopic completed via Next button!');
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleCompleteSubtopic = async () => {
    if (user && topicName && subtopic) {
      await updateProgress(topicName, subtopic, true);
      setIsCompleted(true);
      alert('🎉 Subtopic marked as complete!');
    }
  };

  // Video mapping based on chapter (first digit of subtopic)
  // video-1 = Infinite Potential Well (1.x)
  // video-2 = Finite Potential Well (2.x)
  // video-3 = Tunnelling Effect (3.x)
  const getVideoUrl = () => {
    if (!subtopic) return '/videos/video-1.mp4';
    const chapter = subtopic.charAt(0);
    switch (chapter) {
      case '1': return '/videos/video-1.mp4';
      case '2': return '/videos/video-2.mp4';
      case '3': return '/videos/video-3.mp4';
      default: return '/videos/video-1.mp4';
    }
  };

  const actualVideoUrl = getVideoUrl();

  const handleTakeQuiz = () => {
    navigate(`/physics/${topic}/${subtopic}/quiz/normal`);
  };

  if (!content) {
    return <div className="p-8">Content not found</div>;
  }

  const getCognitiveColor = (load) => {
    if (load > 0.70) return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-200' };
    if (load > 0.55) return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'ring-yellow-200' };
    if (load > 0.40) return { bg: 'bg-blue-500', text: 'text-blue-600', ring: 'ring-blue-200' };
    return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-200' };
  };

  const cogColors = getCognitiveColor(cognitiveLoad);

  const renderContent = (pageData) => {
    const parts = [];
    let keyCounter = 0;

    if (pageData.content) {
      parts.push(<p key={`content-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content}</p>);
    }
    if (pageData.formula) {
      parts.push(
        <div key={`formula-${keyCounter++}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 my-4 border-l-4 border-pink-400 shadow-sm">
          <p className="text-lg font-bold italic text-gray-800 text-center">{pageData.formula}</p>
        </div>
      );
    }
    if (pageData.content2) {
      parts.push(<p key={`content2-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content2}</p>);
    }
    if (pageData.formula2) {
      parts.push(
        <div key={`formula2-${keyCounter++}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 my-4 border-l-4 border-pink-400 shadow-sm">
          <p className="text-lg font-bold italic text-gray-800 text-center">{pageData.formula2}</p>
        </div>
      );
    }
    if (pageData.content3) {
      parts.push(<p key={`content3-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content3}</p>);
    }
    if (pageData.formula3) {
      parts.push(
        <div key={`formula3-${keyCounter++}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 my-4 border-l-4 border-pink-400 shadow-sm">
          <p className="text-lg font-bold italic text-gray-800 text-center">{pageData.formula3}</p>
        </div>
      );
    }
    if (pageData.content4) {
      parts.push(<p key={`content4-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content4}</p>);
    }
    if (pageData.formula4) {
      parts.push(
        <div key={`formula4-${keyCounter++}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 my-4 border-l-4 border-pink-400 shadow-sm">
          <p className="text-lg font-bold italic text-gray-800 text-center">{pageData.formula4}</p>
        </div>
      );
    }
    if (pageData.content5) {
      parts.push(<p key={`content5-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content5}</p>);
    }
    if (pageData.formula5) {
      parts.push(
        <div key={`formula5-${keyCounter++}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 my-4 border-l-4 border-pink-400 shadow-sm">
          <p className="text-lg font-bold italic text-gray-800 text-center">{pageData.formula5}</p>
        </div>
      );
    }
    if (pageData.content6) {
      parts.push(<p key={`content6-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content6}</p>);
    }
    if (pageData.formula6) {
      parts.push(
        <div key={`formula6-${keyCounter++}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 my-4 border-l-4 border-pink-400 shadow-sm">
          <p className="text-lg font-bold italic text-gray-800 text-center">{pageData.formula6}</p>
        </div>
      );
    }
    if (pageData.content7) {
      parts.push(<p key={`content7-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content7}</p>);
    }
    if (pageData.formula7) {
      parts.push(
        <div key={`formula7-${keyCounter++}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 my-4 border-l-4 border-pink-400 shadow-sm">
          <p className="text-lg font-bold italic text-gray-800 text-center">{pageData.formula7}</p>
        </div>
      );
    }
    if (pageData.content8) {
      parts.push(<p key={`content8-${keyCounter++}`} className="mb-4 text-gray-700 leading-relaxed">{pageData.content8}</p>);
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 pb-28">
      {/* Light Peach/Pink Title Bar */}
      <div className="bg-gradient-to-r from-rose-200 via-pink-200 to-orange-200 shadow-lg border-b border-rose-300">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-rose-800 drop-shadow-md text-center">
            {content.title}
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex items-start justify-start px-4 pt-6 gap-4">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 space-y-3">
          {/* AI Monitor */}
          <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-gray-800">🧠 AI Monitor</span>
              </div>
              <button
                onClick={togglePause}
                className={`p-1.5 rounded-md transition-all ${
                  isPaused 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Load</span>
                  <span className={`font-bold text-sm ${cogColors.text}`}>
                    {(cognitiveLoad * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${cogColors.bg} h-2 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${cognitiveLoad * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Focus</span>
                  <span className="font-bold text-sm text-blue-600">
                    {(engagementLevel * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${engagementLevel * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Camera */}
          {showCamera && (
            <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
              <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                <Video className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-600 font-medium">📹 Tracking</span>
              </div>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-32 rounded bg-gray-900 object-cover"
              />
            </div>
          )}

          {/* Character */}
          <div className="transition-transform hover:scale-105 duration-300">
            <svg viewBox="0 0 200 360" className="w-full filter drop-shadow-xl">
              <g>
                <ellipse cx="100" cy="300" rx="50" ry="70" fill="#5DADE2" />
                <path d="M 60 240 Q 30 210 20 185" stroke="#F4D03F" strokeWidth="14" fill="none" strokeLinecap="round" />
                <path d="M 140 240 Q 170 210 180 185" stroke="#F4D03F" strokeWidth="14" fill="none" strokeLinecap="round" />
                <circle cx="20" cy="175" r="18" fill="#FFDAB9" />
                <circle cx="180" cy="175" r="18" fill="#FFDAB9" />
                <circle cx="100" cy="210" r="45" fill="#FFDAB9" />
                <path d="M 65 195 Q 60 175 75 170 Q 85 165 100 170 Q 115 165 125 170 Q 140 175 135 195" fill="#F4D03F" />
                <circle cx="85" cy="205" r="5" fill="#000" />
                <circle cx="115" cy="205" r="5" fill="#000" />
                <path d="M 80 228 Q 100 243 120 228" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="70" cy="218" r="7" fill="#FFB6C1" opacity="0.7" />
                <circle cx="130" cy="218" r="7" fill="#FFB6C1" opacity="0.7" />
                <rect x="15" y="180" width="12" height="18" fill="#8B4513" rx="2" />
                <line x1="17" y1="185" x2="25" y2="185" stroke="#FFF" strokeWidth="1" />
                <line x1="17" y1="190" x2="25" y2="190" stroke="#FFF" strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border-2 border-orange-300 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-xs text-orange-800">Streak</span>
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-xl font-bold text-orange-600 mb-0.5">5 Days</p>
            <p className="text-xs text-orange-700 font-medium">Keep it up!</p>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border-2 border-blue-300 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs text-blue-800">Progress</span>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xl font-bold text-blue-700">
                {Math.round(((currentPage + 1) / totalPages) * 100)}%
              </span>
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Study Tip */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-300 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Coffee className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-xs text-purple-800">Study Tip</span>
            </div>
            <p className="text-xs text-purple-700 leading-relaxed font-medium">
              Take 5-min breaks every 20 minutes! ☕✨
            </p>
          </div>

          {/* Subtopic Navigation */}
          <div className="bg-white rounded-xl p-3 border-2 border-gray-200 shadow-md">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Infinite Potential Well</h3>
            <div className="space-y-1.5">
              {['1.1', '1.2', '1.3', '1.4', '1.5'].map((sub) => (
                <button
                  key={sub}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    subtopic === sub
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Subtopic {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Content Card */}
        <div className="flex-1 max-w-3xl">
          <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl shadow-2xl border-4 border-black p-8 min-h-[540px] relative hover:shadow-3xl transition-shadow duration-300">
            <div className="absolute top-6 right-6 flex gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 border-3 border-yellow-600 shadow-lg"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 border-3 border-orange-600 shadow-lg"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 border-3 border-cyan-600 shadow-lg"></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-5 text-gray-900 pr-32">
                {currentPageData?.heading}
              </h2>
              <div className="text-gray-800 leading-relaxed text-base">
                {renderContent(currentPageData)}
              </div>
            </div>
            
            <div className="absolute bottom-6 right-6 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-gray-300" />
              <span className="text-4xl font-bold text-gray-300">{currentPage + 1}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-3 shadow-lg ${
                currentPage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                  : 'bg-gradient-to-r from-green-400 to-green-500 text-white border-green-600 hover:from-green-500 hover:to-green-600 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`rounded-full transition-all duration-300 border-2 shadow-md ${
                    i === currentPage 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700 w-10 h-3.5 shadow-lg scale-110' 
                      : 'bg-gray-300 border-gray-400 hover:bg-gray-400 w-3 h-3 hover:scale-110'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-3 shadow-lg ${
                currentPage === totalPages - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                  : 'bg-gradient-to-r from-green-400 to-green-500 text-white border-green-600 hover:from-green-500 hover:to-green-600 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side - LARGER ANIMATION */}
        <div className="w-[500px] flex-shrink-0">
          {getAnimationForSubtopic(subtopic)}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-rose-100 via-pink-100 to-orange-100 border-t-4 border-rose-200 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setShowAudioModal(true)}
              className="bg-gradient-to-r from-rose-300 to-pink-300 text-rose-900 px-7 py-3 rounded-xl font-bold text-base border-2 border-rose-400 shadow-lg hover:from-rose-400 hover:to-pink-400 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              <span>Audio Summary</span>
            </button>
            <button 
              onClick={() => {
                setVideoError(false);
                setShowVideoModal(true);
              }}
              className="bg-gradient-to-r from-orange-200 to-rose-200 text-rose-900 px-7 py-3 rounded-xl font-bold text-base border-2 border-orange-300 shadow-lg hover:from-orange-300 hover:to-rose-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Watch Video</span>
            </button>
            <button 
              onClick={handleTakeQuiz}
              className="bg-gradient-to-r from-pink-200 to-rose-300 text-rose-900 px-7 py-3 rounded-xl font-bold text-base border-2 border-pink-300 shadow-lg hover:from-pink-300 hover:to-rose-400 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Take Quiz</span>
            </button>
            <button 
              onClick={() => setShowChatbot(true)}
              className="bg-gradient-to-r from-rose-200 to-orange-200 text-rose-900 px-7 py-3 rounded-xl font-bold text-base border-2 border-rose-300 shadow-lg hover:from-rose-300 hover:to-orange-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Ask Doubt</span>
            </button>
            <button 
              onClick={() => setShowGame(true)}
              className="bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-900 px-7 py-3 rounded-xl font-bold text-base border-2 border-purple-300 shadow-lg hover:from-purple-300 hover:to-indigo-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Play Game</span>
            </button>
            <button 
              onClick={handleCompleteSubtopic}
              disabled={isCompleted}
              className={`px-7 py-3 rounded-xl font-bold text-base border-2 shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-200 to-green-300 text-green-800 border-green-400 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-orange-200 to-pink-200 text-rose-900 border-orange-300 hover:from-orange-300 hover:to-pink-300 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
              }`}
            >
              {isCompleted && <CheckCircle className="w-5 h-5" />}
              <span>{isCompleted ? 'Completed!' : 'Mark Complete'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUDIO MODAL */}
      {showAudioModal && (
        <AudioPlayer
          subtopicId={subtopic}
          onClose={() => setShowAudioModal(false)}
        />
      )}

      {/* VIDEO MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Video Lecture</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl px-3"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              {videoError ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <p className="text-xl mb-2">⚠️ Video not available</p>
                    <p className="text-sm text-gray-400">Path: {actualVideoUrl}</p>
                    <p className="text-sm text-gray-400 mt-4">
                      Add your video files to: <br />
                      <code className="bg-gray-800 px-2 py-1 rounded">frontend/public/videos/</code>
                    </p>
                  </div>
                </div>
              ) : (
                <video
                  ref={modalVideoRef}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onError={() => setVideoError(true)}
                >
                  <source src={actualVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHATBOT MODAL */}
      {showChatbot && (
        <Chatbot
          subtopic={subtopic}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {/* GAME MODAL */}
      {showGame && (
        <QuantumGame onClose={() => setShowGame(false)} />
      )}
    </div>
  );
}