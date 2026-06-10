// PerspectiveRoad.jsx
// Marathon-style perspective road for Gravity Comparison Lab.

export default function PerspectiveRoad({ width, groundY }) {
  const horizonY = groundY - 240;

  const centerX = width / 2;

  const roadTopWidth = 180;
  const roadBottomWidth = width * 2.2;

  const leftTop = centerX - roadTopWidth / 2;
  const rightTop = centerX + roadTopWidth / 2;

  const leftBottom = centerX - roadBottomWidth / 2;
  const rightBottom = centerX + roadBottomWidth / 2;

  return (
    <g>
      <defs>
        <linearGradient id="roadGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#243447" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      {/* atmosphere */}
      <rect
        x="-5000"
        y="-3000"
        width="20000"
        height="3000"
        fill="url(#skyGlow)"
      />

      {/* road */}
      <polygon
        points={`
          ${leftTop},${horizonY}
          ${rightTop},${horizonY}
          ${rightBottom},${groundY + 1500}
          ${leftBottom},${groundY + 1500}
        `}
        fill="url(#roadGradient)"
      />

      {/* left edge */}
      <line
        x1={leftTop}
        y1={horizonY}
        x2={leftBottom}
        y2={groundY + 1500}
        stroke="rgba(255,255,255,0.25)"
      />

      {/* right edge */}
      <line
        x1={rightTop}
        y1={horizonY}
        x2={rightBottom}
        y2={groundY + 1500}
        stroke="rgba(255,255,255,0.25)"
      />

      {/* 6 lanes */}
      {Array.from({ length: 5 }).map((_, i) => {
        const t = (i + 1) / 6;

        const xTop =
          leftTop + (rightTop - leftTop) * t;

        const xBottom =
          leftBottom + (rightBottom - leftBottom) * t;

        return (
          <line
            key={`lane-${i}`}
            x1={xTop}
            y1={horizonY}
            x2={xBottom}
            y2={groundY + 1500}
            stroke="rgba(94,234,212,0.20)"
            strokeWidth="1"
          />
        );
      })}

      {/* road cross lines ////// */}
      {Array.from({ length: 30 }).map((_, i) => {
        const t = i / 30;

        const y =
          horizonY +
          Math.pow(t, 1.75) *
            (groundY + 1200 - horizonY);

        const left =
          leftTop +
          (leftBottom - leftTop) *
            Math.pow(t, 1.1);

        const right =
          rightTop +
          (rightBottom - rightTop) *
            Math.pow(t, 1.1);

        return (
          <line
            key={`cross-${i}`}
            x1={left}
            y1={y}
            x2={right}
            y2={y - 20}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        );
      })}

      {/* horizon glow */}
      <ellipse
        cx={centerX}
        cy={horizonY}
        rx="320"
        ry="50"
        fill="rgba(56,189,248,0.12)"
      />
    </g>
  );
}
