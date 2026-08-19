import React from 'react'

export default function Logo({ size = 'default' }) {
  const isSmall = size === 'small'
  const height = isSmall ? 44 : 56

  return (
    <div className="flex items-center select-none">
      <svg
        height={height}
        viewBox="0 0 260 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4B84A" />
            <stop offset="40%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#B08D1F" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#C9A227" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#glow)">
          <text
            x="95"
            y="72"
            fontFamily="'Cairo', 'Times New Roman', serif"
            fontSize="58"
            fontWeight="700"
            fill="url(#goldGrad)"
            textAnchor="middle"
          >
            M
          </text>

          <text
            x="145"
            y="72"
            fontFamily="'Cairo', 'Times New Roman', serif"
            fontSize="58"
            fontWeight="700"
            fill="url(#goldGrad)"
            textAnchor="middle"
          >
            H
          </text>

          <text
            x="124"
            y="98"
            fontFamily="'Cairo', 'Inter', sans-serif"
            fontSize="20"
            fontWeight="600"
            fill="#B08D1F"
            textAnchor="middle"
            letterSpacing="2.5"
          >
            beauty
          </text>
        </g>
      </svg>
    </div>
  )
}
