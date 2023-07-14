import { BaseSchemes, Scope, ScopeAsParameter } from 'rete'
import { classicConnectionPath } from 'rete-render-utils'
import { BufferGeometry } from 'three'

import { Area3DPlugin } from '../../..'
import { ExpectSchemes } from '../../../types'
import { createClassicConnectionGeometry } from './geometry'

export { createClassicConnectionGeometry }

type Position = { x: number, y: number }
type Requires<Schemes extends BaseSchemes> =
  | { type: 'connectionpath', data: { payload: Schemes['Connection'], path?: string, points: Position[] } }

/**
 * Options for node form generator
 */
export type Props = {
  /** Customize connection geometry */
  customize?: (path: string) => BufferGeometry
}

/**
 * Form generator for embedding connections into 3D scene.
 * @param scope Area3DPlugin instance
 * @param props Options for connection form generator
 */
export function connection<S extends ExpectSchemes, K, E>(scope: ScopeAsParameter<Scope<K, E[]>, [Requires<S>]>, props?: Props) {
  const renderScope = scope as Scope<Requires<S>, E[]>
  const area = renderScope.parentScope<Area3DPlugin<S, Requires<S>>>(Area3DPlugin)
  // const editor = area.parentScope<NodeEditor<S>>(NodeEditor)

  renderScope.addPipe(context => {
    if (!context || typeof context !== 'object' || !('type' in context)) return context

    if (context.type === 'connectionpath') {
      const { id } = context.data.payload
      const view = area.connectionViews.get(id)

      if (view) {
        const path = context.data.path || classicConnectionPath(context.data.points as [Position, Position], 0.3)
        const geometry = props?.customize ? props.customize(path) : createClassicConnectionGeometry(path, 4.6)

        if (geometry) {
          area.area.content.updateGeometry(view.element, geometry)
        }
      }
    }
    return context
  })
}
