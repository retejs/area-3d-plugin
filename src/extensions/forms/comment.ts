import { ConnectionId, NodeId, Scope, ScopeAsParameter } from 'rete'
import { BufferGeometry, ShapeGeometry } from 'three'

import { Area3DPlugin } from '../..'
import { ExpectSchemes, Position } from '../../types'
import { getRoundedShape } from '../../utils/shapes'

export type Pin = {
  id: string
  position: Position
  selected?: boolean
}
export type PinData = {
  id: ConnectionId
  pins: Pin[]
}

type Comment = {
  element: HTMLElement
  id: string
  width: number
  height: number
  x: number
  y: number
}

type Requires =
  | { type: 'commentcreated', data: Comment }
  | { type: 'commentremoved', data: Comment }
  | { type: 'editcomment', data: Comment }
  | { type: 'commentselected', data: Comment }
  | { type: 'commentunselected', data: Comment }
  | { type: 'commenttranslated', data: { id: Comment['id'], dx: number, dy: number, sources?: NodeId[] } }
  | { type: 'commentlinktranslate', data: { id: Comment['id'], link: string } }

export function comment<S extends ExpectSchemes, K>(scope: ScopeAsParameter<Scope<K, any[]>, [Requires]>) {
  const commentScope = scope as unknown as Scope<Requires> & {
    comments: Map<string, Comment>
  }
  const area = commentScope.parentScope<Area3DPlugin<S, any>>(Area3DPlugin)

  commentScope.addPipe(context => {
    if (context.type === 'commentcreated') {
      updateCommentGeometry(area, context.data)
    }
    if (context.type === 'commenttranslated') {
      const { id } = context.data
      const c = commentScope.comments.get(id)

      if (c) {
        updateCommentGeometry(area, c)
      }
    }
    return context
  })
}

type CommentGeometry = BufferGeometry & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __commentGeometry?: {
    width: number
    height: number
    x: number
    y: number
  }
}

function commentGeometry(width: number, height: number, x: number, y: number) {
  const shape = getRoundedShape(width, height, 18)
  const geometry = new ShapeGeometry(shape) as CommentGeometry

  geometry.__commentGeometry = {
    width,
    height,
    x,
    y
  }

  geometry.translate(x, y, 0)

  return geometry
}

function updateCommentGeometry(area: Area3DPlugin<ExpectSchemes, any>, c: Comment) {
  area.area.content.updateGeometry(c.element, existing => {
    const meta = (existing as CommentGeometry)?.__commentGeometry

    if (meta) {
      if (meta.width !== c.width || meta.height !== c.height) {
        return commentGeometry(c.width, c.height, c.x, c.y)
      }
      if (meta.x !== c.x || meta.y !== c.y) {
        return existing?.translate(c.x - meta.x, c.y - meta.y, 0)
      }
    }
    return commentGeometry(c.width, c.height, c.x, c.y)
  })
}
