import { DraggableObject3D } from './scene'
import { ObjectHTML } from './scene/ObjectHTML'
import { Position, Size } from './types'

export type NodeTranslateEventParams = { position: Position, previous: Position }
export type NodeResizeEventParams = { size: Size }

type Events = {
  picked: () => void
  translated: (params: NodeTranslateEventParams) => Promise<unknown | boolean>
  dragged: () => void
  contextmenu: (event: MouseEvent) => void
  resized: (params: NodeResizeEventParams) => Promise<unknown | boolean>
}
type Guards = {
  resize: (params: NodeResizeEventParams) => Promise<unknown | boolean>
  translate: (params: NodeTranslateEventParams) => Promise<unknown | boolean>
}

export class NodeView {
  element: HTMLElement
  object: ObjectHTML
  position: Position

  constructor(private events: Events, private guards: Guards) {
    this.element = document.createElement('div')
    this.element.style.position = 'absolute'
    this.position = { x: 0, y: 0 }
    this.translate(0, 0)

    this.element.addEventListener('contextmenu', event => this.events.contextmenu(event))

    this.object = new DraggableObject3D(this.element, {
      start: this.events.picked,
      translate: this.translate,
      drag: this.events.dragged
    })
  }

  public translate = async (x: number, y: number) => {
    type Params = undefined | { data: NodeTranslateEventParams }
    const previous = { ...this.position }
    const translation = await this.guards.translate({ previous, position: { x, y } }) as Params

    if (!translation) return false

    this.position = { ...translation.data.position }
    this.object.position.set(this.position.x, this.position.y, this.object.position.z)

    await this.events.translated({ position: this.position, previous })

    return true
  }

  public resize = async (width: number, height: number) => {
    const size = { width, height }

    if (!(await this.guards.resize({ size }))) return false

    const el = this.element.children.item(0)

    if (!el || !(el instanceof HTMLElement)) return false

    el.style.width = `${width}px`
    el.style.height = `${height}px`

    await this.events.resized({ size })

    return true
  }

  public destroy() {
    null
  }
}
