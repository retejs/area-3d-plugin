import { Position, Size } from '../types'

/**
 * Bounding box
 */
const min = (arr: number[]) => arr.length === 0 ? 0 : Math.min(...arr)
const max = (arr: number[]) => arr.length === 0 ? 0 : Math.max(...arr)

export function getBoundingBox(rects: ({ position: Position } & Size)[]) {
  const left = min(rects.map(rect => rect.position.x))
  const top = min(rects.map(rect => rect.position.y))
  const right = max(rects.map(rect => rect.position.x + rect.width))
  const bottom = max(rects.map(rect => rect.position.y + rect.height))

  return {
    left,
    right,
    top,
    bottom,
    width: Math.abs(left - right),
    height: Math.abs(top - bottom),
    center: {
      x: (left + right) / 2,
      y: (top + bottom) / 2
    }
  }
}
