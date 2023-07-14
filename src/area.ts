import { Content } from './content'
import { HybridScene } from './scene'
import { orbitControlsRestrictor } from './scene/OrbitControls'
import { Position, Vector3D } from './types'

export type Transform = { position: Vector3D, rotation: Vector3D }
export type TransformEventParams = { previous: Transform | undefined, current: Transform }

type Events = {
  pointerDown: (position: Position, event: PointerEvent) => void
  pointerMove: (position: Position, event: PointerEvent) => void
  pointerUp: (position: Position, event: PointerEvent) => void
  resize: (event: Event) => void
  transformed: (params: TransformEventParams) => Promise<unknown>
  reordered: (element: HTMLElement) => Promise<unknown>
}
type Guards = {
  transform: (params: TransformEventParams) => Promise<unknown | boolean>
}

/**
 * Area class is responsible for managing 3D scene for a current editor
 */
export class Area<Scope> {
  scene: HybridScene<Scope>
  pointer: Position = { x: 0, y: 0 }

  content: Content<Scope>

  constructor(private container: HTMLElement, scene: HybridScene<Scope> | null, private scope: Scope, private events: Events, private guards: Guards) {
    this.scene = scene || new HybridScene(this.container)
    this.content = new Content(this.scene, scope, element => this.events.reordered(element))

    this.container.addEventListener('pointerdown', this.pointerdown)
    this.container.addEventListener('pointermove', this.pointermove)
    window.addEventListener('pointerup', this.pointerup)
    window.addEventListener('resize', this.resize)

    orbitControlsRestrictor(
      this.scene.orbit,
      this.scene.camera,
      (current, previous) => this.guards.transform({ previous, current }),
      (current, previous) => this.events.transformed({ previous, current })
    )

    this.scene.resize(this.container.clientWidth, this.container.clientHeight)
  }

  /**
   * Get the canvas in form of Object3D for the current scope
   */
  public getCanvas() {
    return this.scene.canvases.get(this.scope)
  }

  /**
   * Set the pointer position from the given mouse event into the `pointer` property
   */
  public setPointerFrom(event: MouseEvent) {
    const point = this.scene.getPointerFrom(event, this.scope)

    if (point) {
      this.pointer = {
        x: point.x,
        y: point.y
      }
    }
  }

  private pointerdown = (event: PointerEvent) => {
    this.setPointerFrom(event)
    this.events.pointerDown(this.pointer, event)
  }

  private pointermove = (event: PointerEvent) => {
    this.setPointerFrom(event)
    this.events.pointerMove(this.pointer, event)
  }

  private pointerup = (event: PointerEvent) => {
    this.setPointerFrom(event)
    this.events.pointerUp(this.pointer, event)
  }

  /**
   * Force resize the container of the 3D scene
   * @param event The resize event
   */
  public resize = (event: Event) => {
    this.events.resize(event)
    this.scene.resize(this.container.clientWidth, this.container.clientHeight)
  }

  public destroy() {
    this.container.removeEventListener('pointerdown', this.pointerdown)
    this.container.removeEventListener('pointermove', this.pointermove)
    window.removeEventListener('pointerup', this.pointerup)
    window.removeEventListener('resize', this.resize)
  }
}
