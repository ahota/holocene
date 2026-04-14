import React, { useState, useEffect, useRef } from 'react';
import './Odometer.css';

interface Props {
  targetYear: number;
  initialYear: number;
  onComplete: () => void;
}

/**
 * A specialized odometer reveal animation that handles the 5-digit roll
 * across the Human Era transition.
 */
export default function Odometer({
  targetYear,
  initialYear,
  onComplete,
}: Props) {
  const [current, setCurrent] = useState(initialYear);
  const startTime = useRef<number | null>(null);
  const animationDuration = 5000; // 5 seconds for the full 10,000 year roll
  const startDelay = 1500; // 1.5s initial pause

  useEffect(() => {
    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const progress = Math.min(
          (timestamp - startTime.current) / animationDuration,
          1
        );

        // Quad-in-out easing to handle the slow start, fast middle, and slow finish
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const val = initialYear + (targetYear - initialYear) * ease;

        if (progress < 1) {
          setCurrent(Math.floor(val));
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

  // Handle padding and individual digits
  const digits = current.toString().padStart(5, ' ').split('');

  return (
    <div className="odometer-container" aria-label={`The year is ${current}`}>
      {digits.map((d, i) => (
        <div key={i} className="reel">
          <div className="digit">{d === ' ' ? '' : d}</div>
        </div>
      ))}
    </div>
  );
}
