import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Odometer.css';

interface Props {
  targetYear: number;
  initialYear: number;
  onComplete: () => void;
}

/**
 * A mechanical-style odometer reveal with a "sliding down" effect.
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
        const progress = Math.min((timestamp - startTime.current) / animationDuration, 1);

        // Quart-in-out easing
        const ease = progress < 0.5
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

  const standardDigits = useMemo(() => [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], []);
  const digitsWithBlank = useMemo(() => [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, ' '], []);
  const itemHeightPercent = 100 / 11;

  const offsets = useMemo(() => {
    const res = [0, 0, 0, 0, 0];
    for (let i = 4; i >= 0; i--) {
      const power = Math.pow(10, 4 - i);
      if (i === 4) {
        res[i] = (Math.floor(current) % 10) + (current % 1);
      } else {
        const pull = res[i + 1] > 9 ? res[i + 1] - 9 : 0;
        res[i] = (Math.floor(current / power) % 10) + pull;
      }
    }
    return res;
  }, [current]);

  return (
    <div className="odometer-container" aria-label={`The year is ${Math.floor(current)}`}>
      {offsets.map((offset, i) => {
        const reelDigits = i === 0 ? digitsWithBlank : standardDigits;
        const visualOffset = 10 - offset;
        
        return (
          <div key={i} className="reel-container">
            <div 
              className="reel" 
              style={{ transform: `translateY(${-visualOffset * itemHeightPercent}%)` }}
            >
              {reelDigits.map((digit, dIndex) => (
                <div 
                  key={dIndex} 
                  className="digit"
                  style={{ opacity: Math.max(0, 1 - Math.abs(dIndex - visualOffset) * 0.7) }}
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
