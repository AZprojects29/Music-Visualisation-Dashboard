import { useMemo, useState, useEffect, useRef } from 'react';
import { formatDuration } from '../../data/aggregations';

interface BubbleData {
  name: string;
  value: number;
  percentage: number;
}

interface BubbleChartProps {
  data: BubbleData[];
  maxBubbles?: number;
}

const COLORS = [
  '#1DB954', // Spotify green
  '#1ed760',
  '#2ecc71',
  '#27ae60',
  '#16a085',
  '#1abc9c',
  '#3498db',
  '#2980b9',
  '#9b59b6',
  '#8e44ad',
  '#e74c3c',
  '#c0392b',
  '#e67e22',
  '#d35400',
  '#f39c12',
];

// Easing function outside component to avoid recreating
const elasticOut = (t: number): number => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
};

export function BubbleChart({ data, maxBubbles = 15 }: BubbleChartProps) {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [bubbleScales, setBubbleScales] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Typewriter animation: single animation loop for all bubbles
  useEffect(() => {
    const totalBubbles = Math.min(data.length, maxBubbles);
    const delayPerBubble = 100; // ms between each bubble starting
    const animationDuration = 350; // ms for each bubble's pop animation

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setAnimationKey((k) => k + 1);
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const newScales: number[] = [];

      for (let i = 0; i < totalBubbles; i++) {
        const bubbleStartTime = i * delayPerBubble;
        const bubbleElapsed = elapsed - bubbleStartTime;

        if (bubbleElapsed <= 0) {
          newScales[i] = 0;
        } else if (bubbleElapsed >= animationDuration) {
          newScales[i] = 1;
        } else {
          const progress = bubbleElapsed / animationDuration;
          newScales[i] = elasticOut(progress);
        }
      }

      setBubbleScales(newScales);

      // Continue animation until all bubbles are done
      const totalDuration = (totalBubbles - 1) * delayPerBubble + animationDuration;
      if (elapsed < totalDuration) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, maxBubbles]);

  const bubbles = useMemo(() => {
    const limited = data.slice(0, maxBubbles);
    const maxValue = Math.max(...limited.map((d) => d.value));
    // Larger bubbles on mobile for better visibility
    const minSize = isMobile ? 90 : 60;
    const maxSize = isMobile ? 240 : 180;

    return limited.map((item, index) => {
      const normalizedSize = Math.sqrt(item.value / maxValue);
      const size = minSize + normalizedSize * (maxSize - minSize);

      return {
        ...item,
        size,
        color: COLORS[index % COLORS.length],
      };
    });
  }, [data, maxBubbles, isMobile]);

  // Pack bubbles in a simple grid-like layout
  const positions = useMemo(() => {
    const containerWidth = 800;
    const containerHeight = 500;
    const positions: { x: number; y: number; size: number }[] = [];

    bubbles.forEach((bubble, index) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const x = Math.random() * (containerWidth - bubble.size) + bubble.size / 2;
        const y = Math.random() * (containerHeight - bubble.size) + bubble.size / 2;

        // Check for overlaps
        let overlaps = false;
        for (const pos of positions) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (bubble.size + pos.size) / 2 + 5;

          if (distance < minDistance) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          positions.push({ x, y, size: bubble.size });
          placed = true;
        }

        attempts++;
      }

      // Fallback position if couldn't place without overlap
      if (!placed) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        positions.push({
          x: 100 + col * 180,
          y: 100 + row * 140,
          size: bubble.size,
        });
      }
    });

    return positions;
  }, [bubbles]);

  return (
    <div className="relative w-full" style={{ height: '500px' }}>
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {bubbles.map((bubble, index) => {
          const pos = positions[index];
          if (!pos) return null;

          const bubbleScale = bubbleScales[index] ?? 0;

          // Don't render if scale is 0
          if (bubbleScale === 0) return null;

          const isHovered = hoveredBubble === bubble.name;
          const hoverScale = isHovered ? 1.1 : 1;
          const finalScale = bubbleScale * hoverScale;

          return (
            <g
              key={`${bubble.name}-${animationKey}`}
              onMouseEnter={() => setHoveredBubble(bubble.name)}
              onMouseLeave={() => setHoveredBubble(null)}
              className="cursor-pointer"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${finalScale})`,
                transformOrigin: '0 0',
                transition: bubbleScale >= 1 ? 'transform 0.15s ease-out' : 'none',
              }}
            >
              <circle
                r={bubble.size / 2}
                fill={bubble.color}
                opacity={isHovered ? 1 : 0.85}
                className="transition-opacity duration-200"
              />
              <text
                textAnchor="middle"
                dy="-0.2em"
                fill="white"
                fontSize={Math.max(10, bubble.size / 8)}
                fontWeight="600"
                className="pointer-events-none"
              >
                {bubble.name.length > 12
                  ? bubble.name.slice(0, 10) + '...'
                  : bubble.name}
              </text>
              <text
                textAnchor="middle"
                dy="1.2em"
                fill="rgba(255,255,255,0.8)"
                fontSize={Math.max(8, bubble.size / 10)}
                className="pointer-events-none"
              >
                {bubble.percentage.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredBubble && (
        <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-lg">
          <p className="text-white font-bold text-lg">{hoveredBubble}</p>
          <p className="text-spotify-green font-medium mt-1">
            {formatDuration(
              bubbles.find((b) => b.name === hoveredBubble)?.value || 0
            )}
          </p>
          <p className="text-spotify-light-gray text-sm">
            {bubbles.find((b) => b.name === hoveredBubble)?.percentage.toFixed(1)}%
            of listening
          </p>
        </div>
      )}
    </div>
  );
}
