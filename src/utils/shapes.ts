import { Shape } from 'three'

// eslint-disable-next-line max-statements
export function getRoundedShape(width: number, height: number, radius: number) {
  const shape = new Shape()
  const x = 0
  const y = 0

  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  shape.closePath()

  return shape
}
