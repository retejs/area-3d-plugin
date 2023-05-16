import { BufferGeometry } from 'three'

export function flipFaces(geometry: BufferGeometry) {
  const index = geometry.getIndex()

  if (index) {
    const numTriangles = index.count / 3

    for (let i = 0; i < numTriangles; i++) {
      const a = index.getX(i * 3 + 2)
      const b = index.getX(i * 3 + 1)
      const c = index.getX(i * 3)

      index.setXYZ(i * 3, a, b, c)
    }
  }
}
