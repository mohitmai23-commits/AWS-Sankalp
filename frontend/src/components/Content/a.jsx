import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, Star, Heart, Rocket, Zap, Sun, Moon, Cloud, Waves, Wind, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simplified Content Pages - FILL IN YOUR CONTENT
const SIMPLIFIED_CONTENT = {
  // CHAPTER 1: Infinite Potential Well
  '1.1': {
  title: 'The Particle in a Box - A Simple Story',
  chapter: 1,
  pages: [
    {
      id: 1,
      heading: '📦 Trapped Inside a Perfect Box',
      content: `
An infinite potential well is like trapping a tiny particle inside a box with
unbreakable walls. The particle cannot escape and must stay between x = 0 and x = a.

Inside the box, the particle behaves like a wave. It cannot stay still and can
only form certain standing wave patterns. Because of this, the particle is
allowed only specific energy values.

The lowest energy is not zero. Even in the calmest state, the particle must have
some energy. This is a key difference between classical and quantum physics.
      `,
      analogy: `
Think of a guitar string tied at both ends. It can vibrate only in certain shapes.
The particle is like that string, and the box walls are the fixed ends.
      `
    }
  ],
  
},
  '1.2': {
  title: 'Understanding the Quantum Box',
  chapter: 1,
  pages: [
    {
      id: 1,
      heading: '📦 The Perfect Prison',
      content: `
In an infinite potential well, a particle is trapped inside a box with perfectly
rigid walls. These walls are so strong that the particle can never exist outside
the box.

Inside the box, the particle behaves like a wave. The walls force the wave to be
zero at the edges, so only certain wave patterns are allowed to exist.

Each allowed wave pattern corresponds to a specific energy. This is why the
particle cannot have just any energy value. Instead, its energy is fixed by how
the wave fits inside the box.

This model shows how strict boundaries naturally lead to energy quantization.
      `,
      analogy: `
Like water in a sealed tank, only certain ripple shapes are possible because the
walls stop the waves from spreading freely.
      `
    }
  ]
},

'1.3': {
  title: 'Normalization and Probability',
  chapter: 1,
  pages: [
    {
      id: 1,
      heading: '🎯 Finding the Particle',
      content: `
In quantum mechanics, the wave function tells us where a particle is likely to be
found. But for this information to make sense, all probabilities must add up to
one.

Normalization is simply the rule that the particle must exist somewhere inside
the box with 100 percent certainty.

Once normalized, the square of the wave function gives the probability of finding
the particle at different positions. Some places are more likely than others.

This idea replaces the classical picture of a particle having an exact position.
      `,
      analogy: `
Think of a weather map showing rain chances. The colors do not tell you where the
rain is exactly, but where it is more or less likely.
      `
    }
  ]
},

'1.4': {
  title: 'Energy Levels and Quantum States',
  chapter: 1,
  pages: [
    {
      id: 1,
      heading: '🪜 The Energy Staircase',
      content: `
A particle in a quantum box can only have certain energy values, not a continuous
range. These allowed values are called energy levels.

Each energy level has its own wave pattern, called a quantum state. As the energy
increases, the wave pattern becomes more wiggly.

The particle cannot exist between these levels. It must jump from one level to
another by absorbing or releasing energy.

This step-like behavior is a key feature of quantum systems.
      `,
      analogy: `
Like climbing stairs, you can stand only on steps, not in between them. Quantum
energy works the same way.
      `
    }
  ]
},

'1.5': {
  title: 'Physical Meaning of the Infinite Well',
  chapter: 1,
  pages: [
    {
      id: 1,
      heading: '⚡ Why Zero Energy Is Impossible',
      content: `
One surprising result of the infinite potential well is that the particle can
never have zero energy. Even in its lowest state, it must keep moving.

If the particle had zero energy, it would be completely still and perfectly
localized, which is not allowed in quantum mechanics.

This minimum energy is called zero-point energy. It exists because confining a
particle to a small space always creates uncertainty in its motion.

This idea has no equivalent in classical physics.
      `,
      analogy: `
Imagine trying to hold a spinning top perfectly still. No matter what you do, it
always has a little motion left.
      `
    }
  ]
}
,

  // CHAPTER 2: Finite Potential Well
  '2.1': {
  title: 'The Finite Potential Well - Softer Walls',
  chapter: 2,
  pages: [
    {
      id: 1,
      heading: '🧱 A Box That Leaks a Little',
      content: `
A finite potential well is similar to the infinite box, but now the walls are not
infinitely strong. The particle is mostly inside the box, but there is a small
chance it can be found outside.

Inside the well, the wave wiggles like before. Outside the well, the wave slowly
fades away instead of stopping suddenly. This fading shows that the particle can
"leak" into the barriers.

Only a limited number of energy states are allowed, depending on how deep and wide
the well is.
      `,
      analogy: `
Imagine sound inside a room with thin walls. Most sound stays inside, but some
noise leaks out. The particle behaves in a similar way.
      `
    }
  ]
},
 '2.2': {
  title: 'The Finite Potential Well',
  chapter: 2,
  pages: [
    {
      id: 1,
      heading: '🧱 Softer Walls, New Possibilities',
      content: `
A finite potential well is like the infinite box, but the walls are not perfectly
rigid. The particle is mostly trapped inside, but the walls are low enough that
the wave can slightly spread outside.

The space is divided into three regions: the left side, the middle well, and the
right side. Inside the well, the particle behaves like a wave that wiggles. Outside,
the wave does not vanish suddenly,it slowly fades away.

Because the well is symmetric, the wave patterns can be neat and balanced or
slightly flipped. This symmetry helps us understand how different states form.
      `,
      analogy: `
Think of a dog inside a fenced park. It stays mostly inside, but its tail or nose
can stick out a little through the gaps.
      `
    }
  ]
},

'2.3': {
  title: 'Bound States in the Finite Well',
  chapter: 2,
  pages: [
    {
      id: 1,
      heading: '🎯 Trapped, But Not Completely',
      content: `
When the particle’s energy is low enough, it remains bound to the well. This means
it cannot escape fully, but it is not perfectly confined either.

Inside the well, the wave moves up and down smoothly. Outside the well, the wave
shrinks quickly as we move farther away. These shrinking parts are called tails.

The wave must connect smoothly at the boundaries. This matching rule allows only
certain energies to exist. These special energies form the allowed bound states.

Not every energy works,only the ones that make the wave fit properly.
      `,
      analogy: `
Like tying a rope between two posts, only certain knot positions keep the rope
smooth without sharp bends.
      `
    }
  ]
},

'2.4': {
  title: 'Energy Levels in a Finite Well',
  chapter: 2,
  pages: [
    {
      id: 1,
      heading: '🪜 Fewer Steps, Lower Heights',
      content: `
A finite potential well has fewer allowed energy levels than an infinite well.
This is because the walls are not strong enough to trap very high-energy states.

The energy levels are also lower than those in an infinite well. Since the wave
spreads outside the well, the particle has more room to exist, which reduces its
energy.

At higher energies, the particle is no longer bound. It can move freely, and the
energy values become continuous instead of fixed.

This behavior makes the finite well a better model for real physical systems.
      `,
      analogy: `
Imagine a shallow bowl instead of a deep pit. Small balls stay inside, but fast
ones roll out easily.
      `
    }
  ]
}
,

  // CHAPTER 3: Quantum Tunnelling
'3.1': {
  title: 'Quantum Tunnelling - Breaking the Rules',
  chapter: 3,
  pages: [
    {
      id: 1,
      heading: '🚪 Passing Through the Impossible',
      content: `
Quantum tunnelling happens when a particle crosses a barrier even though it does
not have enough energy to climb over it.

Inside the barrier, the wave becomes smaller but does not vanish. If the barrier
is thin enough, the wave appears on the other side, meaning the particle has
tunnelled through.

This effect is purely quantum and has no explanation in classical physics.
      `,
      analogy: `
Imagine throwing a ball at a wall and seeing it appear on the other side. That
would be impossible in daily life, but in the quantum world, it can happen.
      `
    }
  ]
},
  '3.2': {
    title: 'How Tunnelling Works',
    chapter: 3,
    pages: [
      {
        id: 1,
        heading: '🌊 The Wave That Sneaks Through',
        content: `/* ADD YOUR SIMPLIFIED CONTENT HERE */`,
        analogy: `/* ADD YOUR ANALOGY HERE */`
      }
    ]
  },
  '3.2': {
  title: 'Quantum Tunnelling from a Finite Well',
  chapter: 3,
  pages: [
    {
      id: 1,
      heading: '🚪 Slipping Through the Wall',
      content: `
In quantum physics, a particle can sometimes appear in places where it does not
have enough energy to go classically. This strange effect is called tunnelling.

In a finite potential well, the particle is mostly inside the well, but its wave
does not stop suddenly at the walls. Instead, it fades into the outside regions.

Because of this fading, there is a small chance that the particle can leak out of
the well. Thinner or lower walls make this leakage more likely.

If the walls were infinitely high, this would not happen. Tunnelling exists only
because real barriers are never perfect.
      `,
      analogy: `
Like hearing music through a thin wall, even though the sound should stay inside
the room.
      `
    }
  ]
},

'3.3': {
  title: 'From Trapped to Free Motion',
  chapter: 3,
  pages: [
    {
      id: 1,
      heading: '🌊 When the Particle Breaks Free',
      content: `
When the particle has enough energy, it is no longer trapped inside the well. It
can move freely across all regions of space.

In this case, the energy is no longer limited to special values. Instead, the
particle can have any energy above a certain level.

The wave spreads everywhere and keeps oscillating instead of fading away. Some of
the wave may still bounce back due to interference, while the rest moves forward.

This marks the transition from bound states to free, moving particles.
      `,
      analogy: `
Like water spilling over a shallow bowl and flowing freely once it has enough
speed.
      `
    }
  ]
},

'3.4': {
  title: 'Why Quantum Tunnelling Matters',
  chapter: 3,
  pages: [
    {
      id: 1,
      heading: '🔬 Quantum Magic in Real Life',
      content: `
Quantum tunnelling explains many real-world phenomena that classical physics
cannot.

Inside atoms, tunnelling allows particles to escape in processes like nuclear
decay. In laboratories, it powers devices that can see individual atoms.

Modern electronics also rely on tunnelling at very small scales, especially in
tiny components where particles move through narrow barriers.

These effects show that tunnelling is not just a theory,it shapes technology and
nature at the smallest scales.
      `,
      analogy: `
Like a shortcut through a mountain that lets travelers reach places they should
not be able to cross.
      `
    }
  ]
}};

// Grid Paper Background Component - Light Green Grid on White
const GridPaperBackground = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#90EE90" strokeWidth="0.5" opacity="0.6"/>
      </pattern>
      <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#smallGrid)"/>
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#90EE90" strokeWidth="1" opacity="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="white"/>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

// ==========================================
// CHAPTER 1 ANIMATION: Guitar String / Standing Waves
// Story: A particle trapped like a vibrating guitar string
// ==========================================
const Chapter1Animation = ({ subtopic }) => {
  const [pluckPosition, setPluckPosition] = useState(null);
  const [n, setN] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showParticle, setShowParticle] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.1);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePluck = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setPluckPosition(x);
    setTimeout(() => setPluckPosition(null), 500);
  };

  // Generate wave points
  const generateWave = () => {
    const points = [];
    const amplitude = 80;
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const y = Math.sin(n * Math.PI * x) * Math.cos(time * 3) * amplitude;
      points.push(`${50 + x * 400},${150 + y}`);
    }
    return points.join(' ');
  };

  // Particle position on wave
  const particleX = 50 + (0.5 + 0.3 * Math.sin(time * 2)) * 400;
  const particleY = 150 + Math.sin(n * Math.PI * (0.5 + 0.3 * Math.sin(time * 2))) * Math.cos(time * 3) * 80;

  return (
    <div className="h-full rounded-3xl p-6 relative overflow-hidden">
      {/* Grid Paper Background */}
      <GridPaperBackground />
      
      {/* Content on top of grid - Scrollable */}
      <div className="relative z-10 h-full overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 1rem)' }}>
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-center mb-4 text-gray-800"
        >
          🎸 The Quantum Guitar String
        </motion.h2>

        {/* Story Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 rounded-xl p-4 mb-4 border-2 border-gray-300 shadow-md"
        >
          <p className="text-gray-700 text-lg text-center leading-relaxed">
            <span className="text-blue-600 font-bold">Imagine:</span> A tiny particle trapped between two walls, 
            vibrating like a guitar string! It can only make certain "notes" - that's <span className="text-purple-600 font-bold">quantum energy!</span>
          </p>
        </motion.div>

        {/* Interactive Wave Display */}
        <div 
          className="relative cursor-pointer bg-white/80 rounded-xl border-2 border-gray-300"
          onClick={handlePluck}
        >
          <svg width="100%" height="200" viewBox="0 0 500 300" className="mx-auto">
            {/* Left Wall - Solid Gray */}
            <rect x="40" y="50" width="15" height="200" rx="5" fill="#4B5563" />
            <text x="47" y="40" textAnchor="middle" fill="#4B5563" fontSize="20" fontWeight="bold">WALL</text>
            
            {/* Right Wall - Solid Gray */}
            <rect x="445" y="50" width="15" height="200" rx="5" fill="#4B5563" />
            <text x="452" y="40" textAnchor="middle" fill="#4B5563" fontSize="20" fontWeight="bold">WALL</text>

            {/* Wave String - Solid Blue */}
            <motion.polyline
              points={generateWave()}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Particle - Solid Orange */}
            {showParticle && (
              <motion.g
                animate={{ x: particleX - 250, y: particleY - 150 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <circle cx="250" cy="150" r="15" fill="#F97316" />
                <circle cx="250" cy="150" r="8" fill="#FDBA74" />
                <text x="250" y="155" textAnchor="middle" fontSize="14">🎵</text>
              </motion.g>
            )}

            {/* Pluck Effect */}
            {pluckPosition && (
              <motion.circle
                cx={50 + pluckPosition * 400}
                cy="150"
                r="30"
                fill="none"
                stroke="#F97316"
                strokeWidth="3"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Node indicators - Solid Red */}
            {[...Array(n - 1)].map((_, i) => (
              <motion.circle
                key={i}
                cx={50 + ((i + 1) / n) * 400}
                cy="150"
                r="6"
                fill="#EF4444"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </svg>
          <p className="text-center text-gray-500 text-sm mt-2 pb-2">👆 Click to pluck the string!</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-800 font-bold">Energy Level:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setN(level)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-full font-bold text-lg transition-all border-2 ${
                    n === level
                      ? 'bg-blue-500 text-white border-blue-700 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  n={level}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold shadow-md border-2 border-green-700"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowParticle(!showParticle)}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold shadow-md border-2 border-purple-700"
            >
              {showParticle ? '👻 Hide Particle' : '✨ Show Particle'}
            </motion.button>
          </div>
        </div>

        {/* Learning Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-amber-50 rounded-xl p-4 border-2 border-amber-400"
        >
          <p className="text-gray-800 text-center">
            <span className="text-amber-600 text-xl">💡</span> 
            <span className="font-bold text-amber-700"> n={n}:</span>
            <span className="text-gray-700"> {n === 1 ? "Lowest energy - one smooth wave!" : 
              n === 2 ? "More energy - two half-waves with a node in middle!" :
              `Even more energy - ${n} half-waves with ${n-1} nodes!`}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// CHAPTER 2 ANIMATION: Leaky House / Finite Well
// Story: A particle in a house with thin walls it can peek through
// ==========================================
const Chapter2Animation = ({ subtopic }) => {
  const [wallThickness, setWallThickness] = useState(50);
  const [energy, setEnergy] = useState(0.5);
  const [showTails, setShowTails] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Calculate decay rate based on wall thickness
  const decayRate = wallThickness / 30;

  return (
    <div className="h-full rounded-3xl p-6 relative overflow-hidden">
      {/* Grid Paper Background */}
      <GridPaperBackground />
      
      {/* Content on top of grid - Scrollable */}
      <div className="relative z-10 h-full overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 1rem)' }}>
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-center mb-4 text-gray-800"
        >
          🏠 The Leaky Quantum House
        </motion.h2>

        {/* Story Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 rounded-xl p-4 mb-4 border-2 border-gray-300 shadow-md"
        >
          <p className="text-gray-700 text-lg text-center leading-relaxed">
            <span className="text-teal-600 font-bold">Now imagine:</span> The walls aren't perfect anymore! 
            The particle stays mostly inside, but its "wave" <span className="text-emerald-600 font-bold">leaks through</span> the walls like light through curtains!
          </p>
        </motion.div>

        {/* House Visualization */}
        <div className="relative bg-white/80 rounded-xl border-2 border-gray-300">
          <svg width="100%" height="220" viewBox="0 0 500 220" className="mx-auto">
            {/* Outside Zones */}
            <rect x="0" y="40" width="100" height="160" fill="#E5E7EB" rx="10" />
            <rect x="400" y="40" width="100" height="160" fill="#E5E7EB" rx="10" />
            <text x="50" y="30" textAnchor="middle" fill="#6B7280" fontSize="11">OUTSIDE</text>
            <text x="450" y="30" textAnchor="middle" fill="#6B7280" fontSize="11">OUTSIDE</text>

            {/* House/Well - Solid Teal */}
            <rect x="100" y="40" width="300" height="160" fill="#99F6E4" opacity="0.5" rx="10" />
            <text x="250" y="30" textAnchor="middle" fill="#0D9488" fontSize="12" fontWeight="bold">INSIDE THE WELL</text>

            {/* Walls - Solid Orange */}
            <motion.rect 
              x={100 - wallThickness/4} 
              y="40" 
              width={wallThickness/2} 
              height="160" 
              fill="#F97316" 
              rx="5"
            />
            <motion.rect 
              x={400 - wallThickness/4} 
              y="40" 
              width={wallThickness/2} 
              height="160" 
              fill="#F97316" 
              rx="5"
            />

            {/* Wave inside - Solid Teal */}
            <motion.path
              d={`M 110 120 Q 180 ${120 - 60 * Math.sin(time * 2)} 250 120 Q 320 ${120 + 60 * Math.sin(time * 2)} 390 120`}
              fill="none"
              stroke="#0D9488"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Exponential tails outside */}
            {showTails && (
              <>
                {/* Left tail - Solid Teal with decreasing opacity */}
                <motion.path
                  d={`M 110 120 Q 70 ${120 - 20 * Math.exp(-decayRate * 0.5) * Math.sin(time * 2)} 20 120`}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
                {/* Right tail */}
                <motion.path
                  d={`M 390 120 Q 430 ${120 + 20 * Math.exp(-decayRate * 0.5) * Math.sin(time * 2)} 480 120`}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              </>
            )}

            {/* Particle - Solid Yellow */}
            <motion.g
              animate={{
                x: 150 * Math.sin(time) + (showTails ? Math.random() * 20 - 10 : 0)
              }}
            >
              <circle cx="250" cy="120" r="12" fill="#FBBF24" />
              <circle cx="250" cy="120" r="6" fill="#FEF3C7" />
              <text x="250" y="125" textAnchor="middle" fontSize="10">😊</text>
            </motion.g>

            {/* Ghost particles outside (tunneling visualization) */}
            {showTails && (
              <>
                <motion.g
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <circle cx="60" cy="120" r="10" fill="#FBBF24" opacity="0.4" />
                  <text x="60" y="125" textAnchor="middle" fontSize="8" opacity="0.6">👻</text>
                </motion.g>
                <motion.g
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <circle cx="440" cy="120" r="10" fill="#FBBF24" opacity="0.4" />
                  <text x="440" y="125" textAnchor="middle" fontSize="8" opacity="0.6">👻</text>
                </motion.g>
              </>
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="w-full max-w-md bg-white/90 rounded-xl p-4 border-2 border-gray-300">
            <label className="text-gray-800 font-bold block mb-2 text-center">
              🧱 Wall Thickness: {wallThickness}%
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={wallThickness}
              onChange={(e) => setWallThickness(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-gray-500 text-sm mt-1">
              <span>Thin (more leakage)</span>
              <span>Thick (less leakage)</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTails(!showTails)}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold shadow-md border-2 border-teal-700"
          >
            {showTails ? '🙈 Hide Wave Tails' : '👀 Show Wave Tails'}
          </motion.button>
        </div>

        {/* Learning Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-teal-50 rounded-xl p-4 border-2 border-teal-400"
        >
          <p className="text-gray-800 text-center">
            <span className="text-teal-600 text-xl">💡</span> 
            <span className="font-bold text-teal-700"> Key Insight:</span>
            <span className="text-gray-700"> Unlike the infinite well, the wave doesn't stop at the walls - it fades exponentially outside! The thinner the wall, the more it "leaks"!</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// CHAPTER 3 ANIMATION: Ghost Through Wall / Tunneling
// Story: A particle that can magically pass through barriers
// ==========================================
const Chapter3Animation = ({ subtopic }) => {
  const [isTunneling, setIsTunneling] = useState(false);
  const [barrierHeight, setBarrierHeight] = useState(60);
  const [particleEnergy, setParticleEnergy] = useState(40);
  const [tunnelCount, setTunnelCount] = useState(0);
  const [particles, setParticles] = useState([]);

  const handleTunnel = () => {
    setIsTunneling(true);
    
    // Calculate tunneling probability (simplified)
    const probability = Math.exp(-(barrierHeight - particleEnergy) / 20);
    const willTunnel = Math.random() < probability;
    
    const newParticle = {
      id: Date.now(),
      willTunnel,
      startTime: Date.now()
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    if (willTunnel) {
      setTunnelCount(prev => prev + 1);
    }
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      setIsTunneling(false);
    }, 2000);
  };

  return (
    <div className="h-full rounded-3xl p-6 relative overflow-hidden">
      {/* Grid Paper Background */}
      <GridPaperBackground />
      
      {/* Content on top of grid - Scrollable */}
      <div className="relative z-10 h-full overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 1rem)' }}>
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-center mb-4 text-gray-800"
        >
          👻 The Ghost Particle
        </motion.h2>

        {/* Story Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 rounded-xl p-4 mb-4 border-2 border-gray-300 shadow-md"
        >
          <p className="text-gray-700 text-lg text-center leading-relaxed">
            <span className="text-violet-600 font-bold">Magic time:</span> In quantum physics, particles can 
            <span className="text-fuchsia-600 font-bold"> walk through walls</span> like ghosts! 
            Even without enough energy to climb over, they can <span className="text-pink-600 font-bold">tunnel through!</span>
          </p>
        </motion.div>

        {/* Tunneling Visualization */}
        <div className="relative bg-white/80 rounded-xl border-2 border-gray-300">
          <svg width="100%" height="200" viewBox="0 0 500 200" className="mx-auto">
            {/* Ground */}
            <rect x="0" y="170" width="500" height="30" fill="#E5E7EB" />

            {/* Energy level indicator */}
            <line x1="0" y1={170 - particleEnergy} x2="500" y2={170 - particleEnergy} 
                  stroke="#FBBF24" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
            <text x="10" y={165 - particleEnergy} fill="#D97706" fontSize="10">Particle Energy</text>

            {/* Barrier - Solid Red */}
            <motion.rect
              x="220"
              y={170 - barrierHeight}
              width="60"
              height={barrierHeight}
              fill="#EF4444"
              rx="5"
            />
            <text x="250" y={155 - barrierHeight} textAnchor="middle" fill="#DC2626" fontSize="11" fontWeight="bold">
              BARRIER
            </text>

            {/* Barrier height marker */}
            <line x1="290" y1="170" x2="290" y2={170 - barrierHeight} stroke="#F87171" strokeWidth="1" />
            <text x="300" y={170 - barrierHeight/2} fill="#EF4444" fontSize="10">{barrierHeight}%</text>

            {/* Waiting particle - Solid Orange */}
            <motion.g
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <circle cx="100" cy={170 - particleEnergy/2} r="18" fill="#F97316" />
              <circle cx="100" cy={170 - particleEnergy/2} r="10" fill="#FDBA74" />
              <text x="100" y={175 - particleEnergy/2} textAnchor="middle" fontSize="12">🏃</text>
            </motion.g>

            {/* Animated tunneling particles */}
            {particles.map((particle) => (
              <motion.g
                key={particle.id}
                initial={{ x: 0, opacity: 1 }}
                animate={particle.willTunnel ? {
                  x: [0, 120, 160, 300],
                  opacity: [1, 0.3, 0.3, 1],
                  scale: [1, 0.5, 0.5, 1]
                } : {
                  x: [0, 100, 80, 0],
                  opacity: [1, 0.5, 0.8, 1]
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <circle cx="100" cy={170 - particleEnergy/2} r="18" 
                        fill={particle.willTunnel ? "#22C55E" : "#EF4444"} />
                <text x="100" y={175 - particleEnergy/2} textAnchor="middle" fontSize="12">
                  {particle.willTunnel ? "👻" : "💥"}
                </text>
              </motion.g>
            ))}

            {/* Success zone */}
            <text x="400" y="100" textAnchor="middle" fill="#22C55E" fontSize="14">🎉</text>
            <text x="400" y="120" textAnchor="middle" fill="#16A34A" fontSize="10">SUCCESS!</text>
          </svg>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/90 rounded-xl p-3 border-2 border-gray-300">
            <label className="text-gray-800 font-bold block mb-2 text-sm">
              🧱 Barrier Height: {barrierHeight}%
            </label>
            <input
              type="range"
              min="30"
              max="100"
              value={barrierHeight}
              onChange={(e) => setBarrierHeight(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
          <div className="bg-white/90 rounded-xl p-3 border-2 border-gray-300">
            <label className="text-gray-800 font-bold block mb-2 text-sm">
              ⚡ Particle Energy: {particleEnergy}%
            </label>
            <input
              type="range"
              min="10"
              max="80"
              value={particleEnergy}
              onChange={(e) => setParticleEnergy(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTunnel}
            disabled={isTunneling}
            className={`px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-all border-2 ${
              isTunneling 
                ? 'bg-gray-400 border-gray-500 cursor-not-allowed' 
                : 'bg-violet-500 border-violet-700 hover:bg-violet-600'
            } text-white`}
          >
            {isTunneling ? '⏳ Tunneling...' : '🚀 Try to Tunnel!'}
          </motion.button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center bg-white/90 rounded-xl px-6 py-3 border-2 border-gray-300">
            <p className="text-gray-500 text-sm">Successful Tunnels</p>
            <p className="text-3xl font-bold text-green-500">{tunnelCount}</p>
          </div>
          <div className="text-center bg-white/90 rounded-xl px-6 py-3 border-2 border-gray-300">
            <p className="text-gray-500 text-sm">Tunnel Probability</p>
            <p className="text-3xl font-bold text-violet-500">
              {Math.round(Math.exp(-(barrierHeight - particleEnergy) / 20) * 100)}%
            </p>
          </div>
        </div>

        {/* Learning Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-violet-50 rounded-xl p-4 border-2 border-violet-400"
        >
          <p className="text-gray-800 text-center">
            <span className="text-violet-600 text-xl">💡</span> 
            <span className="font-bold text-violet-700"> Key Insight:</span>
            <span className="text-gray-700"> Lower barrier + Higher energy = More tunneling! This is how the Sun works - protons tunnel to fuse together!</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Get animation component based on chapter
const getAnimationForChapter = (chapter, subtopic) => {
  switch(chapter) {
    case 1:
      return <Chapter1Animation subtopic={subtopic} />;
    case 2:
      return <Chapter2Animation subtopic={subtopic} />;
    case 3:
      return <Chapter3Animation subtopic={subtopic} />;
    default:
      return <Chapter1Animation subtopic={subtopic} />;
  }
};

// ==========================================
// MAIN SIMPLIFIED CONTENT VIEWER COMPONENT
// ==========================================
export default function SimplifiedContentViewer({ topic, subtopic }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  const content = SIMPLIFIED_CONTENT[subtopic];
  const totalPages = content?.pages?.length || 0;
  const currentPageData = content?.pages[currentPage];
  const chapter = content?.chapter || 1;

  if (!content) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-600">Content not found for {subtopic}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-28 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #d4a574 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Beige Title Bar */}
      <div className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 shadow-lg border-b-4 border-amber-300 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-bold transition-all shadow-md"
          >
            <Home className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-amber-900 drop-shadow-sm text-center flex-1">
             {content.title} 
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Relaxation Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl mx-auto mt-6 px-4 relative z-10"
      >
        <div className="bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-lg">
          <p className="text-center text-amber-800 text-xl font-medium">
             <span className="font-bold">Relax Mode Activated!</span> 
            <br />
            <span className="text-lg">Take your time with these simplified explanations. No pressure! 💆‍♂️</span>
          </p>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex items-start justify-center px-6 pt-8 gap-8 relative z-10">
        {/* Left Side - Content Card */}
        <div className="flex-1 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-2xl border-4 border-amber-200 p-10 min-h-[500px] relative"
          >
            {/* Decorative corners - Solid Colors */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400 shadow-md flex items-center justify-center">
                ☀️
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-400 shadow-md flex items-center justify-center">
                💖
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-400 shadow-md flex items-center justify-center">
                ⭐
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-xl max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 pr-28">
                {currentPageData?.heading}
              </h2>
              
              {/* Main Content */}
              <div className="text-gray-700 leading-relaxed text-xl space-y-6">
                <p>{currentPageData?.content}</p>
              </div>

              {/* Analogy Box */}
              {currentPageData?.analogy && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 bg-amber-50 rounded-2xl p-6 border-2 border-amber-300"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">🎯</span>
                    <div>
                      <h4 className="font-bold text-amber-800 text-xl mb-2">Simple Analogy:</h4>
                      <p className="text-amber-900 text-lg">{currentPageData?.analogy}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Formula (if any, simplified) */}
              {currentPageData?.formula && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 bg-blue-50 rounded-2xl p-6 border-2 border-blue-300 text-center"
                >
                  <p className="text-2xl font-bold text-blue-800">{currentPageData.formula}</p>
                </motion.div>
              )}
            </div>

            {/* Page indicator */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 text-amber-300">
              <Star className="w-6 h-6" />
              <span className="text-4xl font-bold">{currentPage + 1}</span>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl border-2 ${
                currentPage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                  : 'bg-amber-500 text-white border-amber-700 hover:bg-amber-600'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
              Previous
            </motion.button>

            <div className="flex gap-3">
              {Array.from({ length: totalPages }, (_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentPage(i)}
                  className={`rounded-full transition-all shadow-md border-2 ${
                    i === currentPage 
                      ? 'bg-amber-500 border-amber-700 w-12 h-4' 
                      : 'bg-gray-300 border-gray-400 hover:bg-gray-400 w-4 h-4'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl border-2 ${
                currentPage === totalPages - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                  : 'bg-amber-500 text-white border-amber-700 hover:bg-amber-600'
              }`}
            >
              Next
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Right Side - Animation */}
        <div className="w-[520px] flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-[620px] rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden"
          >
            {getAnimationForChapter(chapter, subtopic)}
          </motion.div>
        </div>
      </div>

      {/* Friendly Mascot */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-32 left-8 z-50"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white rounded-3xl p-4 shadow-2xl border-4 border-amber-300 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <span className="text-5xl">🦉</span>
            <div>
              <p className="font-bold text-amber-800 text-lg">Professor Owl says:</p>
              <p className="text-gray-600">"You're doing great! Take it one step at a time! 🌟"</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Action Bar - Beige Theme */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-t-4 border-amber-300 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-500 border-2 border-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-purple-600 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">🔊</span>
              <span>Listen to Story</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="bg-rose-500 border-2 border-rose-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-rose-600 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">🎬</span>
              <span>Watch Animation</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-500 border-2 border-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">🎮</span>
              <span>Fun Quiz</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="bg-amber-500 border-2 border-amber-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-amber-600 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">📚</span>
              <span>Back to Normal</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}