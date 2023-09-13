/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import parse from 'parse-svg-path'
// @ts-ignore
import contours from 'svg-path-contours'
import { BufferGeometry, PlaneGeometry, Vector2 } from 'three'

/**
 * Create geometry for classic connection.
 * Can be used in `customize` option.
 * @param path SVG path
 * @param width Connection width
 * @returns Connection geometry
 */
// eslint-disable-next-line max-statements
export function createClassicConnectionGeometry(path: string, width: number): BufferGeometry {
  const segments = contours(parse(path)) as [number, number][][]
  const points = segments.map(segment => segment.map(([x, y]) => ({ x, y }))).flat()
  const geometry: BufferGeometry = new PlaneGeometry(100, 10, points.length - 1, 1)

  for (let i = 0; i < points.length; i++) {
    const normal = new Vector2(0, width / 2)
    const point = new Vector2(points[i].x, points[i].y)

    if (i > 0 && i < points.length - 1) {
      const prevPoint = new Vector2(points[i - 1].x, points[i - 1].y)
      const nextPoint = new Vector2(points[i + 1].x, points[i + 1].y)
      const vectorBetweenPoints = nextPoint.clone().sub(prevPoint)
      const normalBetweenPoints = new Vector2(-vectorBetweenPoints.y, vectorBetweenPoints.x).clone().normalize()

      normal.set(normalBetweenPoints.x, normalBetweenPoints.y).multiplyScalar(width / 2)
    }

    geometry.attributes.position.setX(i, point.x + normal.x)
    geometry.attributes.position.setY(i, point.y + normal.y)

    geometry.attributes.position.setX(i + points.length, point.x - normal.x)
    geometry.attributes.position.setY(i + points.length, point.y - normal.y)
  }

  return geometry
}
