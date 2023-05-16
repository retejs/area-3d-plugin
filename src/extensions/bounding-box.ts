import { BaseSchemes, NodeEditor } from 'rete'

import { Area3DPlugin } from '..'
import { ExpectSchemes } from '../types'
import { getBoundingBox as getBBox } from '../utils/bounding-box'
import { getNodesRect } from '../utils/rects'

export type NodeRef<Schemes extends BaseSchemes> = Schemes['Node'] | Schemes['Node']['id']

export function getBoundingBox<Schemes extends ExpectSchemes, K>(plugin: Area3DPlugin<Schemes, K>, nodes: NodeRef<Schemes>[]) {
  const editor = plugin.parentScope<NodeEditor<Schemes>>(NodeEditor)
  const list = nodes.map(node => typeof node === 'object' ? node : editor.getNode(node))
  const rects = getNodesRect(list, plugin.nodeViews)

  return getBBox(rects)
}
