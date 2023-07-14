import { ConnectionId, NodeId, Root, Scope } from 'rete'
import { BaseArea, BaseAreaPlugin } from 'rete-area-plugin'

import { Area, TransformEventParams } from './area'
import { ConnectionView } from './connection-view'
import { ElementsHolder } from './elements-holder'
import { NodeView } from './node-view'
import { ExpectSchemes, GetRenderTypes, Position } from './types'

export type { Area } from './area'
export * as Area3DExtensions from './extensions'
export type { HybridScene } from './scene'
export type { HybridRenderer } from './scene/HybridRenderer'

export type RenderMeta = { filled?: boolean }

/**
 * Signal types produced by Area3DPlugin instance
 * @priority 10
 */
export type Area3D<Schemes extends ExpectSchemes> =
  | BaseArea<Schemes>
  | { type: 'transform', data: TransformEventParams }
  | { type: 'transformed', data: TransformEventParams }
  | { type: 'resized', data: { event: Event } }

export type Area3DInherited<Schemes extends ExpectSchemes, ExtraSignals = never> = [Area3D<Schemes> | ExtraSignals, Root<Schemes>]

/**
 * Plugin for embedding node editor into 3D scene.
 * @priority 9
 */
export class Area3DPlugin<Schemes extends ExpectSchemes, ExtraSignals = never> extends BaseAreaPlugin<Schemes, Area3D<Schemes> | ExtraSignals> {
  /**
   * Area instance, contains nodes, connections and other elements
   */
  public area: Area<Area3DPlugin<Schemes, ExtraSignals>>
  public nodeViews = new Map<NodeId, NodeView>()
  public connectionViews = new Map<ConnectionId, ConnectionView>()
  public elements = new ElementsHolder<HTMLElement, Extract<Area3D<Schemes>, { type: 'render' }>['data'] & RenderMeta>()
  public container: HTMLElement

  /**
   * @param container HTML element to render area in
   */
  constructor(container: HTMLElement)
  constructor(shared: Area3DPlugin<Schemes, ExtraSignals>)
  constructor(argument: HTMLElement | Area3DPlugin<Schemes, ExtraSignals>) {
    super('area-3d')
    this.container = argument instanceof Area3DPlugin ? argument.container : argument
    this.container.style.overflow = 'hidden'
    this.container.addEventListener('contextmenu', this.onContextMenu)

    this.area = new Area(
      this.container,
      argument instanceof Area3DPlugin ? argument.area.scene : null,
      this,
      {
        pointerDown: (position, event) => this.emit({ type: 'pointerdown', data: { position, event } }),
        pointerMove: (position, event) => this.emit({ type: 'pointermove', data: { position, event } }),
        pointerUp: (position, event) => this.emit({ type: 'pointerup', data: { position, event } }),
        resize: event => this.emit({ type: 'resized', data: { event } }),
        transformed: params => this.emit({ type: 'transformed', data: params }),
        reordered: element => this.emit({ type: 'reordered', data: { element } })
      },
      {
        transform: params => this.emit({ type: 'transform', data: params })
      }
    )
    this.area.scene.addCanvasFor(this)
  }

  /**
   * Share the 3D scene with multiple instances of Area3DPlugin
   * @returns new instance of Area3DPlugin
   */
  share() {
    return new Area3DPlugin<Schemes, ExtraSignals>(this)
  }

  setParent(scope: Scope<Root<Schemes>, []>) {
    super.setParent(scope)

    this.addPipe(context => {
      if (!context || !(typeof context === 'object' && 'type' in context)) return context
      if (context.type === 'nodecreated') {
        this.addNodeView(context.data)
      }
      if (context.type === 'noderemoved') {
        this.removeNodeView(context.data.id)
      }
      if (context.type === 'connectioncreated') {
        this.addConnectionView(context.data)
      }
      if (context.type === 'connectionremoved') {
        this.removeConnectionView(context.data.id)
      }
      if (context.type === 'render') {
        this.elements.set(context.data)
      }
      if (context.type === 'unmount') {
        this.elements.delete(context.data.element)
      }
      return context
    })
  }

  private onContextMenu = (event: MouseEvent) => {
    this.emit({ type: 'contextmenu', data: { event, context: 'root' } })
  }

  public addNodeView(node: Schemes['Node']) {
    const { id } = node
    const view = new NodeView(
      {
        picked: () => this.emit({ type: 'nodepicked', data: { id } }),
        translated: data => this.emit({ type: 'nodetranslated', data: { id, ...data } }),
        dragged: () => this.emit({ type: 'nodedragged', data: node }),
        contextmenu: event => this.emit({ type: 'contextmenu', data: { event, context: node } }),
        resized: ({ size }) => this.emit({ type: 'noderesized', data: { id: node.id, size } })
      },
      {
        translate: data => this.emit({ type: 'nodetranslate', data: { id, ...data } }),
        resize: ({ size }) => this.emit({ type: 'noderesize', data: { id: node.id, size } })
      }
    )

    this.nodeViews.set(id, view)
    this.area.content.add(view.element, view.object)

    this.emit({
      type: 'render',
      data: { element: view.element, type: 'node', payload: node }
    })

    return view
  }

  public removeNodeView(id: NodeId) {
    const view = this.nodeViews.get(id)

    if (view) {
      this.emit({ type: 'unmount', data: { element: view.element } })
      this.nodeViews.delete(id)
      this.area.content.remove(view.element)
    }
  }

  public addConnectionView(connection: Schemes['Connection']) {
    const view = new ConnectionView({
      contextmenu: event => this.emit({ type: 'contextmenu', data: { event, context: connection } })
    })

    this.connectionViews.set(connection.id, view)
    this.area.content.add(view.element, view.object)

    this.emit({
      type: 'render',
      data: { element: view.element, type: 'connection', payload: connection }
    })

    return view
  }

  public removeConnectionView(id: ConnectionId) {
    const view = this.connectionViews.get(id)

    if (view) {
      this.emit({ type: 'unmount', data: { element: view.element } })
      this.connectionViews.delete(id)
      this.area.content.remove(view.element)
    }
  }

  /**
   * Translate node to position
   * @param id Node id
   * @param position Position
   */
  public async translate(id: NodeId, { x, y }: Position) {
    const view = this.nodeViews.get(id)

    if (view) return await view.translate(x, y)
  }

  /**
   * Resize node
   * @param id Node id
   * @param width Desired width
   * @param height Desired height
   */
  public async resize(id: NodeId, width: number, height: number) {
    const view = this.nodeViews.get(id)

    if (view) return await view.resize(width, height)
  }

  /**
   * Force update rendered element by id (node, connection, etc.)
   * @param type Element type
   * @param id Element id
   * @emits render
   */
  public async update(type: GetRenderTypes<Area3D<Schemes>> | GetRenderTypes<ExtraSignals>, id: string) {
    const data = this.elements.get(type, id)

    if (data) await this.emit({ type: 'render', data } as Area3D<Schemes>)
  }

  /**
   * Destroy all views and remove all event listeners
   */
  destroy() {
    this.container.removeEventListener('contextmenu', this.onContextMenu)
    Array.from(this.connectionViews.keys()).forEach(id => this.removeConnectionView(id))
    Array.from(this.nodeViews.keys()).forEach(id => this.removeNodeView(id))
    this.area.destroy()
  }
}
