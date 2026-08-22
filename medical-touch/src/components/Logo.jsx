import React from 'react'

export default function Logo({ size = 'default' }) {
  const isSmall = size === 'small'
  const height = isSmall ? 44 : 56

  return (
    <img
      src="/iconandlogo.png"
      alt="MH beauty"
      style={{ height, width: 'auto' }}
      className="block select-none object-contain"
    />
  )
}
