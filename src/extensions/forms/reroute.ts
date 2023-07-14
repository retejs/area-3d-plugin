import { ConnectionId, Root, Scope, ScopeAsParameter } from 'rete'
import { RenderSignal } from 'rete-area-plugin'
import { CircleGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { Area3DPlugin } from '../..'
import { ExpectSchemes, Position } from '../../types'

export type Pin = {
  id: string
  position: Position
  selected?: boolean
}
export type PinData = {
  id: ConnectionId
  pins: Pin[]
}

type Requires =
  | RenderSignal<'reroute-pins', { data: PinData }>

/**
 * Form generator for embedding rete-connection-reroute-plugin into 3D scene.
 * @param scope Area3DPlugin instance
 */
export function reroute<S extends ExpectSchemes, K>(scope: ScopeAsParameter<Scope<K, [Root<S>]>, [Requires]>) {
  if (!(scope instanceof Area3DPlugin<S, Requires>)) throw new Error('')
  const area = scope as Area3DPlugin<S, Requires>

  area.addPipe(context => {
    if (!context || typeof context !== 'object' || !('type' in context)) return context
    if (context.type === 'render' && context.data.type === 'reroute-pins') {
      const pinGeometry = new CircleGeometry(10, 16)
      const pins = context.data.data.pins.map(pin => {
        return pinGeometry.clone().translate(pin.position.x, pin.position.y, 0)
      })

      // eslint-disable-next-line no-undefined
      area.area.content.updateGeometry(context.data.element, pins.length ? mergeGeometries(pins) : undefined)
    }
    return context
  })
}
