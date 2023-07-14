import { NodeEditor } from 'rete'
import { BufferGeometry } from 'three'

import { Area3DPlugin } from '../../..'
import { ExpectSchemes } from '../../../types'
import { createClassicNodeGeometry } from './geometry'

export { createClassicNodeGeometry }

/**
 * Options for node form generator
 */
export type Props<S extends ExpectSchemes> = {
  /** Customize node geometry */
  customize?: (node: S['Node']) => BufferGeometry
}

/**
 * Form generator for embedding nodes into 3D scene.
 * @param area Area3DPlugin instance
 * @param props Options for node form generator
 */
export function node<S extends ExpectSchemes, K>(area: Area3DPlugin<S, K>, props?: Props<S>) {
  const editor = area.parentScope<NodeEditor<S>>(NodeEditor)

  area.addPipe(context => {
    if (!context || typeof context !== 'object' || !('type' in context)) return context
    if (context.type === 'render' && context.data.type === 'node') {
      const id = context.data.payload.id
      const currentNode = editor.getNode(id)
      const geometry = props?.customize ? props.customize(currentNode) : createClassicNodeGeometry(currentNode)

      area.area.content.updateGeometry(context.data.element, geometry)
    }
    return context
  })
}
