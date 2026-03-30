'use client';

import { useId } from 'react';
import type { QuizAxisDefinition, QuizScoreMap } from '@/modules/quizzes/types';

interface TernaryPlotProps {
  axes: QuizAxisDefinition[];
  centerLabel: string;
  scores: QuizScoreMap;
}

/**
 * Resolves one axis definition by its fixed plot corner.
 */
function getAxisByCorner(
  axes: QuizAxisDefinition[],
  corner: QuizAxisDefinition['corner']
): QuizAxisDefinition | null {
  return axes.find((axis) => axis.corner === corner) ?? null;
}

/**
 * Renders one generic ternary plot for every quiz variant.
 */
export function TernaryPlot({ axes, centerLabel, scores }: TernaryPlotProps) {
  const gradientId = useId().replace(/:/g, '');
  const glowId = `${gradientId}-glow`;
  const dotGlowId = `${gradientId}-dot`;
  const edgeId = `${gradientId}-edge`;
  const fillId = `${gradientId}-fill`;

  const topAxis = getAxisByCorner(axes, 'top');
  const leftAxis = getAxisByCorner(axes, 'bottom-left');
  const rightAxis = getAxisByCorner(axes, 'bottom-right');

  if (!topAxis || !leftAxis || !rightAxis) {
    return null;
  }

  const size = 380;
  const padding = 55;
  const sideLength = size - padding * 2;
  const height = sideLength * (Math.sqrt(3) / 2);

  const top = { x: size / 2, y: padding };
  const bottomLeft = { x: padding, y: padding + height };
  const bottomRight = { x: size - padding, y: padding + height };

  const midTopLeft = {
    x: (top.x + bottomLeft.x) / 2,
    y: (top.y + bottomLeft.y) / 2,
  };
  const midTopRight = {
    x: (top.x + bottomRight.x) / 2,
    y: (top.y + bottomRight.y) / 2,
  };
  const midBottom = {
    x: (bottomLeft.x + bottomRight.x) / 2,
    y: (bottomLeft.y + bottomRight.y) / 2,
  };
  const centroid = {
    x: (top.x + bottomLeft.x + bottomRight.x) / 3,
    y: (top.y + bottomLeft.y + bottomRight.y) / 3,
  };

  const total =
    (scores[topAxis.key] ?? 0) +
    (scores[leftAxis.key] ?? 0) +
    (scores[rightAxis.key] ?? 0);
  const topWeight = total > 0 ? (scores[topAxis.key] ?? 0) / total : 1 / 3;
  const rightWeight = total > 0 ? (scores[rightAxis.key] ?? 0) / total : 1 / 3;

  const normalizedX = (2 * rightWeight + topWeight) / 2;
  const normalizedY = (Math.sqrt(3) / 2) * topWeight;
  const plotX = bottomLeft.x + normalizedX * sideLength;
  const plotY = bottomLeft.y - normalizedY * sideLength;

  const topZone = {
    x: (top.x + midTopLeft.x + midTopRight.x) / 3,
    y: (top.y + midTopLeft.y + midTopRight.y) / 3,
  };
  const leftZone = {
    x: (bottomLeft.x + midTopLeft.x + midBottom.x) / 3,
    y: (bottomLeft.y + midTopLeft.y + midBottom.y) / 3,
  };
  const rightZone = {
    x: (bottomRight.x + midTopRight.x + midBottom.x) / 3,
    y: (bottomRight.y + midTopRight.y + midBottom.y) / 3,
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size - 10}`}
      style={{ width: '100%', maxWidth: 380 }}
    >
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={dotGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f2" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6366f2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={edgeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99, 102, 242, 0.72)" />
          <stop offset="50%" stopColor="rgba(139, 92, 246, 0.42)" />
          <stop offset="100%" stopColor="rgba(14, 165, 233, 0.44)" />
        </linearGradient>
        <linearGradient id={fillId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(99, 102, 242, 0.14)" />
          <stop offset="100%" stopColor="rgba(99, 102, 242, 0.04)" />
        </linearGradient>
      </defs>

      <polygon
        points={`${top.x},${top.y} ${bottomLeft.x},${bottomLeft.y} ${bottomRight.x},${bottomRight.y}`}
        fill={`url(#${fillId})`}
      />

      {[
        [midTopLeft, midBottom],
        [midTopRight, midBottom],
        [midTopLeft, midTopRight],
      ].map(([from, to], index) => (
        <line
          key={`divider-${index}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth="0.8"
          strokeDasharray="4 6"
        />
      ))}

      {[
        { pos: topZone, label: topAxis.zoneLabel },
        { pos: leftZone, label: leftAxis.zoneLabel },
        { pos: rightZone, label: rightAxis.zoneLabel },
        { pos: centroid, label: centerLabel },
      ].map(({ pos, label }) => (
        <text
          key={label}
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="inherit"
          fontSize="7"
          fill="rgba(148, 163, 184, 0.68)"
          letterSpacing="2"
        >
          {label}
        </text>
      ))}

      <polygon
        points={`${top.x},${top.y} ${bottomLeft.x},${bottomLeft.y} ${bottomRight.x},${bottomRight.y}`}
        fill="none"
        stroke={`url(#${edgeId})`}
        strokeWidth="2"
      />

      {[top, bottomLeft, bottomRight].map((point, index) => (
        <circle
          key={`corner-${index}`}
          cx={point.x}
          cy={point.y}
          r="3.2"
          fill="rgba(148, 163, 184, 0.6)"
        />
      ))}

      <circle cx={plotX} cy={plotY} r="22" fill={`url(#${dotGlowId})`} />
      <circle
        cx={plotX}
        cy={plotY}
        r="8"
        fill="#6366f2"
        filter={`url(#${glowId})`}
      />
      <circle cx={plotX} cy={plotY} r="3" fill="#0f172a" />

      {[
        { axis: topAxis, point: top, dy: -14 },
        { axis: leftAxis, point: bottomLeft, dy: 16 },
        { axis: rightAxis, point: bottomRight, dy: 16 },
      ].map(({ axis, point, dy }) => (
        <g key={axis.key}>
          <text
            x={point.x}
            y={point.y + dy}
            textAnchor="middle"
            fontFamily="inherit"
            fontSize="11"
            fontWeight="700"
            fill="#e2e8f0"
            letterSpacing="3"
          >
            {axis.label.toUpperCase()}
          </text>
          <text
            x={point.x}
            y={point.y + dy + 11}
            textAnchor="middle"
            fontFamily="inherit"
            fontSize="7"
            fill="rgba(148, 163, 184, 0.8)"
          >
            {axis.hint}
          </text>
        </g>
      ))}
    </svg>
  );
}
