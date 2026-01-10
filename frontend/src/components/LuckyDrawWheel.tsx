import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuckyDrawWheelProps {
  userId: string;
}

interface Prize {
  type: string;
  label: string;
  color: string;
  probability: number;
}

const prizes: Prize[] = [
  { type: 'XP_100', label: '100 XP', color: '#60a5fa', probability: 30 },
  { type: 'XP_250', label: '250 XP', color: '#34d399', probability: 25 },
  { type: 'XP_500', label: '500 XP', color: '#fbbf24', probability: 15 },
  { type: 'XP_1000', label: '1000 XP', color: '#f87171', probability: 8 },
  { type: 'BADGE_RARE', label: 'Rare Badge', color: '#a78bfa', probability: 10 },
  { type: 'BADGE_EPIC', label: 'Epic Badge', color: '#fb923c', probability: 7 },
  { type: 'DISCOUNT_10', label: '10% Discount', color: '#22d3ee', probability: 4 },
  { type: 'FEATURE_BOOST', label: 'Feature Boost', color: '#ec4899', probability: 1 },
];

const LuckyDrawWheel = ({ userId }: LuckyDrawWheelProps) => {
  const [canDraw, setCanDraw] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  useEffect(() => {
    checkDrawEligibility();
  }, [userId]);

  const checkDrawEligibility = async () => {
    try {
      const response = await fetch(`/api/gamification/rewards/lucky-draw/can-draw/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCanDraw(data.canDraw);
      }
    } catch (err) {
      console.error('Failed to check draw eligibility:', err);
    }
  };

  const handleSpin = async () => {
    if (!canDraw || spinning) return;

    try {
      setSpinning(true);
      
      // Call API to spin
      const response = await fetch('/api/gamification/rewards/lucky-draw/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        const prizeIndex = prizes.findIndex(p => p.type === data.prize);
        
        // Calculate rotation
        const segmentAngle = 360 / prizes.length;
        const targetRotation = 360 * 3 + (prizeIndex * segmentAngle); // 3 full rotations + target
        
        setRotation(targetRotation);
        
        // Wait for spin animation
        setTimeout(() => {
          setWonPrize(prizes[prizeIndex]);
          setShowPrizeModal(true);
          setSpinning(false);
          setCanDraw(false);
        }, 4000);
      } else {
        setSpinning(false);
        alert('You can only spin once per day!');
      }
    } catch (err) {
      setSpinning(false);
      console.error('Failed to spin:', err);
    }
  };

  const handleClaimPrize = async () => {
    setShowPrizeModal(false);
    // Optionally call API to claim prize
  };

  return (
    <div className="text-center">
      {/* Wheel */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
          className="w-full h-full rounded-full shadow-2xl relative overflow-hidden"
          style={{
            background: `conic-gradient(
              ${prizes.map((prize, i) => {
                const start = (i / prizes.length) * 360;
                const end = ((i + 1) / prizes.length) * 360;
                return `${prize.color} ${start}deg ${end}deg`;
              }).join(', ')}
            )`
          }}
        >
          {/* Prize Labels */}
          {prizes.map((prize, index) => {
            const angle = (index / prizes.length) * 360 + (360 / prizes.length / 2);
            const radius = 80;
            const x = radius * Math.cos((angle - 90) * Math.PI / 180);
            const y = radius * Math.sin((angle - 90) * Math.PI / 180);
            
            return (
              <div
                key={index}
                className="absolute text-white font-bold text-xs"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`
                }}
              >
                {prize.label}
              </div>
            );
          })}
        </motion.div>
        
        {/* Center Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-4 border-yellow-500">
            <span className="text-2xl">🎰</span>
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="text-4xl">📌</div>
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={!canDraw || spinning}
        className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all ${
          canDraw && !spinning
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 cursor-pointer'
            : 'bg-gray-400 cursor-not-allowed opacity-50'
        }`}
      >
        {spinning ? '🎰 Spinning...' : canDraw ? '🎯 Spin the Wheel!' : '❌ Come Back Tomorrow'}
      </button>

      {/* Prize Modal */}
      <AnimatePresence>
        {showPrizeModal && wonPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPrizeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-8xl text-center mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                Congratulations!
              </h2>
              <div 
                className="text-2xl font-bold text-center p-6 rounded-lg mb-6"
                style={{ backgroundColor: wonPrize.color, color: 'white' }}
              >
                {wonPrize.label}
              </div>
              <button
                onClick={handleClaimPrize}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                ✅ Claim Prize
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuckyDrawWheel;
