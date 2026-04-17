"use client"

export function Card2D({ card, ...props }: any) {
  return <div {...props}>{card?.name ?? 'Card'}</div>
}

export default Card2D;
