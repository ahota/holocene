import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Odometer.css';

interface Props {
  targetYear: number;
  initialYear: number;
  onComplete: () => void;
}

/**
 * A mechanical-style odometer reveal with a "sliding down" effect.
 * Features steep quart-in-out easing and leading digits sliding from blanks.
 */
export default function Odometer({
  targetYear,
  initialYear,
  onComplete,
}: Props) {
  const [current, setCurrent] = useState(initialYear);
  const startTime = useRef<number | null>(null);
  const animationDuration = 7000;
  const startDelay = 1500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const progress = Math.min(
          (timestamp - startTime.current) / animationDuration,
          1
        );

        // Quart-in-out easing
        const ease =
          progress < 0.5
            ? 8 * progress * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 4) / 2;

        const val = initialYear + (targetYear - initialYear) * ease;

        if (progress < 1) {
          setCurrent(val);
          requestAnimationFrame(step);
        } else {
          setCurrent(targetYear);
          onComplete();
        }
      };
      requestAnimationFrame(step);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [targetYear, initialYear, onComplete]);

  // Digits array for sliding DOWN. 
  // Standard: [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  // Value 0 -> index 10
  // Value 1 -> index 9
  // ...
  const standardDigits = useMemo(() => [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], []);
  
  // For the leading digit, we want value 0 to be a blank space
  const digitsWithBlank = useMemo(() => [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, ' '], []);
  
  const itemHeightPercent = 100 / 11;

  const getOffsets = (value: number) => {
    const offsets = [0, 0, 0, 0, 0];
    for (let i = 4; i >= 0; i--) {
      const power = Math.pow(10, 4 - i);
      if (i === 4) {
        offsets[i] = (Math.floor(value) % 10) + (value % 1);
      } else {
        const prevOffset = offsets[i + 1];
        const pull = prevOffset > 9 ? prevOffset - 9 : 0;
        offsets[i] = (Math.floor(value / power) % 10) + pull;
      }
    }
    return offsets;
  };

  const offsets = getOffsets(current);

  return (
    <div className="odometer-container" aria-label={`The year is ${Math.floor(current)}`}>
      {offsets.map((offset, i) => {
        // The first reel (ten-thousands) uses the blank-leading digit stack
        const reelDigits = i === 0 ? digitsWithBlank : standardDigits;
        const visualOffset = 10 - offset;
        
        return (
          <div key={i} className="reel-container">
            <div 
              className="reel" 
              style={{ 
                transform: `translateY(${-visualOffset * itemHeightPercent}%)`,
              }}
            >
              {reelDigits.map((digit, dIndex) => {
                const dist = Math.abs(dIndex - visualOffset);
                const opacity = Math.max(0, 1 - dist * 0.7);
                
                return (
                  <div 
                    key={dIndex} 
                    className="digit"
                    style={{ opacity }}
                  >
                    {digit}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
