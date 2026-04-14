# Holocene Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An interactive 12,026-year timeline with a dramatic odometer reveal and high-performance canvas rendering.

**Architecture:** React for UI and state, HTML5 Canvas for the scrolling timeline to ensure 60fps performance across 12,000+ years. Coordinate system uses "World Units" (Years) mapped to screen pixels via a logarithmic zoom level.

**Tech Stack:** React, TypeScript, Vite, CSS (Vanilla), Vitest for logic testing.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Create `package.json` with dependencies**
```json
{
  "name": "holocene",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Initialize basic `App.tsx`**
```tsx
import React from 'react';

export default function App() {
  return (
    <div className="app" style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>the year is</h1>
      <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>2026</div>
    </div>
  );
}
```

- [ ] **Step 4: Create `index.html` and `main.tsx`**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Holocene</title>
    <style>body { margin: 0; background: #000; color: #fff; font-family: sans-serif; overflow: hidden; }</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Run `npm install` and verify `npm run dev` starts**
Run: `npm install && npm run dev -- --port 3000` (Wait for it to start, then kill it)

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "chore: scaffold project with React, TypeScript, and Vite"
```

---

### Task 2: Coordinate & Math Utils (TDD)

**Files:**
- Create: `src/utils/math.ts`
- Test: `src/utils/math.test.ts`

- [ ] **Step 1: Write test for world-to-screen coordinate transform**
```typescript
import { describe, it, expect } from 'vitest';
import { worldToScreen } from './math';

describe('worldToScreen', () => {
  it('centers the current year when offset is 0', () => {
    const screenX = worldToScreen(12026, 12026, 10, 1000);
    expect(screenX).toBe(500);
  });

  it('shifts correctly based on zoom', () => {
    // 1 year to the left, zoom=10px per year
    const screenX = worldToScreen(12025, 12026, 10, 1000);
    expect(screenX).toBe(490);
  });
});
```

- [ ] **Step 2: Implement `worldToScreen`**
```typescript
export function worldToScreen(year: number, centerYear: number, pixelsPerYear: number, screenWidth: number): number {
  return (year - centerYear) * pixelsPerYear + screenWidth / 2;
}
```

- [ ] **Step 3: Run tests and verify PASS**
Run: `npm run test`

- [ ] **Step 4: Commit**
```bash
git add src/utils/math.ts src/utils/math.test.ts
git commit -m "feat: add world-to-screen coordinate logic with tests"
```

---

### Task 3: The Odometer Component

**Files:**
- Create: `src/components/Odometer/Odometer.tsx`
- Create: `src/components/Odometer/Odometer.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `Odometer.css` for vertical reels**
```css
.odometer-container {
  display: flex;
  font-size: 5rem;
  font-weight: 800;
  height: 1.2em;
  overflow: hidden;
  justify-content: center;
  width: 5ch; /* 5 digits width */
}
.reel {
  display: flex;
  flex-direction: column;
  transition: transform 0.1s linear;
}
.digit {
  height: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 2: Implement `Odometer.tsx` with reel logic**
```tsx
import React, { useState, useEffect } from 'react';
import './Odometer.css';

interface Props {
  targetYear: number;
  initialYear: number;
  onComplete: () => void;
}

export default function Odometer({ targetYear, initialYear, onComplete }: Props) {
  const [current, setCurrent] = useState(initialYear);

  useEffect(() => {
    const timer = setTimeout(() => {
      let val = initialYear;
      const step = () => {
        val += 50; // Simple speedup logic for now, will refine with easing
        if (val >= targetYear) {
          setCurrent(targetYear);
          onComplete();
        } else {
          setCurrent(Math.floor(val));
          requestAnimationFrame(step);
        }
      };
      step();
    }, 1500);
    return () => clearTimeout(timer);
  }, [targetYear, initialYear, onComplete]);

  const digits = current.toString().padStart(5, ' ').split('');

  return (
    <div className="odometer-container">
      {digits.map((d, i) => (
        <div key={i} className="reel">
          <div className="digit">{d === ' ' ? '' : d}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Integrate into `App.tsx`**
```tsx
import React, { useState } from 'react';
import Odometer from './components/Odometer/Odometer';

export default function App() {
  const [revealDone, setRevealDone] = useState(false);

  return (
    <div className="app" style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontWeight: 300, marginBottom: '2rem' }}>the year is</h1>
      <Odometer 
        targetYear={12026} 
        initialYear={2026} 
        onComplete={() => setRevealDone(true)} 
      />
      {revealDone && <div style={{ marginTop: '2rem', opacity: 0.5 }}>Timeline coming soon...</div>}
    </div>
  );
}
```

- [ ] **Step 4: Commit**
```bash
git add src/components/Odometer/ src/App.tsx
git commit -m "feat: implement odometer reveal animation"
```

---

### Task 4: Timeline Canvas Engine

**Files:**
- Create: `src/components/Timeline/TimelineCanvas.tsx`
- Create: `src/components/Timeline/useTimeline.ts`

- [ ] **Step 1: Create `useTimeline.ts` for camera state**
```typescript
import { useState, useCallback } from 'react';

export function useTimeline(initialYear: number) {
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10); // pixels per year

  const scroll = useCallback((deltaY: number) => {
    setCenterYear(prev => prev + deltaY / zoom);
  }, [zoom]);

  return { centerYear, zoom, setZoom, scroll };
}
```

- [ ] **Step 2: Implement `TimelineCanvas.tsx`**
```tsx
import React, { useRef, useEffect } from 'react';
import { worldToScreen } from '../../utils/math';

interface Props {
  centerYear: number;
  zoom: number;
}

export default function TimelineCanvas({ centerYear, zoom }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#333';
      ctx.fillStyle = '#fff';
      
      // Draw 12026 current year marker
      const startOfYearX = worldToScreen(12026, centerYear, zoom, canvas.width);
      ctx.beginPath();
      ctx.moveTo(startOfYearX, canvas.height / 2 - 20);
      ctx.lineTo(startOfYearX, canvas.height / 2 + 20);
      ctx.stroke();
      ctx.fillText('12026 HE', startOfYearX + 5, canvas.height / 2 + 30);

      requestAnimationFrame(render);
    };
    render();
  }, [centerYear, zoom]);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />;
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/Timeline/
git commit -m "feat: add basic canvas timeline engine"
```

---

### Task 5: Interactive Drag & Zoom

- [ ] **Step 1: Add drag handling to `TimelineCanvas.tsx`**
- [ ] **Step 2: Add mousewheel zoom logic**
- [ ] **Step 3: Integrate ZoomSlider component**
- [ ] **Step 4: Commit**
```bash
git commit -m "feat: add drag and zoom interactivity to timeline"
```

---

### Task 6: Adaptive Ticks & Events

- [ ] **Step 1: Implement `drawTicks` function with LOD logic**
- [ ] **Step 2: Add `src/data/events.ts` with initial milestones**
- [ ] **Step 3: Render event markers and labels on canvas**
- [ ] **Step 4: Commit**
```bash
git commit -m "feat: implement adaptive ticks and historical events"
```
