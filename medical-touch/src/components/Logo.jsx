import React from 'react'

export default function Logo({ size = 'default' }) {
  const isSmall = size === 'small'
  const width = isSmall ? 110 : 150

  return (
    <div className="flex items-center select-none" style={{ paddingTop: 4, paddingBottom: 4 }}>
      <svg
        width={width}
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4B84A" />
            <stop offset="40%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#B08D1F" />
          </linearGradient>
          <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8CF5E" />
            <stop offset="100%" stopColor="#C9A227" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#C9A227" floodOpacity="0.25"/>
          </filter>
        </defs>

        {/* BT Monogram with Face Silhouette */}
        <g filter="url(#glow)">
          {/* T letter */}
          <text
            x="130"
            y="70"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontSize="70"
            fontWeight="400"
            fill="url(#goldGrad)"
            textAnchor="middle"
          >T</text>

          {/* B letter */}
          <text
            x="105"
            y="70"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontSize="70"
            fontWeight="400"
            fill="url(#goldGrad)"
            textAnchor="middle"
          >B</text>

          {/* Face silhouette curve inside B */}
          <path
            d="M90 28 Q78 32 76 48 Q74 58 82 62 Q78 68 82 76 Q86 82 96 84 Q106 86 114 80"
            fill="none"
            stroke="url(#goldLight)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Hair wave */}
          <path
            d="M90 28 Q82 30 78 38 Q74 46 76 54"
            fill="none"
            stroke="url(#goldLight)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Chin/neck line */}
          <path
            d="M96 84 Q100 92 108 94"
            fill="none"
            stroke="url(#goldLight)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Decorative bottom swirl */}
          <path
            d="M80 88 Q110 105 140 82"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Beauty Touch text */}
        <text
          x="120"
          y="118"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="15"
          fontWeight="400"
          fill="url(#goldGrad)"
          textAnchor="middle"
          letterSpacing="3"
        >Beauty Touch</text>

        {/* Divider lines with flower */}
        <line x1="45" y1="134" x2="105" y2="134" stroke="#D4B84A" strokeWidth="0.6" />
        <line x1="135" y1="134" x2="195" y2="134" stroke="#D4B84A" strokeWidth="0.6" />

        {/* Flower / Lotus */}
        <g transform="translate(120, 134)">
          {/* Center dot */}
          <circle cx="0" cy="0" r="1.5" fill="#B08D1F" />
          {/* Petals */}
          <ellipse cx="0" cy="-5" rx="3" ry="5" fill="none" stroke="#C9A227" strokeWidth="0.6" />
          <ellipse cx="4.5" cy="-2" rx="3" ry="5" transform="rotate(72 4.5 -2)" fill="none" stroke="#C9A227" strokeWidth="0.6" />
          <ellipse cx="3" cy="4" rx="3" ry="5" transform="rotate(144 3 4)" fill="none" stroke="#C9A227" strokeWidth="0.6" />
          <ellipse cx="-3" cy="4" rx="3" ry="5" transform="rotate(216 -3 4)" fill="none" stroke="#C9A227" strokeWidth="0.6" />
          <ellipse cx="-4.5" cy="-2" rx="3" ry="5" transform="rotate(288 -4.5 -2)" fill="none" stroke="#C9A227" strokeWidth="0.6" />
        </g>

        {/* Arabic tagline */}
        <text
          x="120"
          y="160"
          fontFamily="'Cairo', sans-serif"
          fontSize="11"
          fontWeight="400"
          fill="#B08D1F"
          textAnchor="middle"
          letterSpacing="0.5"
        >لمسة الجمال ... تبدأ من هنا</text>
      </svg>
    </div>
  )
}
