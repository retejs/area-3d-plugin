import { BufferGeometry, CircleGeometry, ShapeGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { Size } from '../../../types'
import { getRoundedShape } from '../../../utils/shapes'

type Params = {
  socketRadius?: number
  socketMargin?: number
  inputsOffset?: number
  outputsOffset?: number
  borderRadius?: number
}

export function createClassicNodeGeometry(size: Size, params?: Params) {
  const {
    borderRadius = 10,
    inputsOffset = 15.5,
    outputsOffset = 44.5,
    socketRadius = 12.3,
    socketMargin = 11.5
  } = params || {}
  const fixWidth = size.width - 1 // hide border artifact
  const fixHeight = size.height - 1 // hide border artifact
  const shape = getRoundedShape(fixWidth, fixHeight, borderRadius * 1.05)
  const geometry = new ShapeGeometry(shape)
  const circle = new CircleGeometry(socketRadius, 16)

  const extra: BufferGeometry[] = []

  if ('inputs' in size) {
    const inputs = Object.entries((size as any).inputs).length

    for (let index = 0; index < inputs; index++) {
      const geom = circle.clone()
      const x = 1.5
      const y = size.height - socketRadius - inputsOffset - ((socketRadius * 2 + socketMargin) * index)

      geom.translate(x, y, 0)

      extra.push(geom)
    }
  }
  if ('outputs' in size) {
    const outputs = Object.entries((size as any).outputs).length

    for (let index = 0; index < outputs; index++) {
      const geom = circle.clone()
      const x = size.width - 1.5
      const y = socketRadius + outputsOffset + ((socketRadius * 2 + socketMargin) * index)

      geom.translate(x, y, 0)

      extra.push(geom)
    }
  }

  return mergeGeometries([...extra, geometry])
}
